import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom"; // ✅ Ajout
import { FolderArchive, Cpu, Zap, Link as LinkIcon, Download, Info, ArrowRight, Plus, X, Trash2 } from "lucide-react";
import { getCoursPratiques, uploadCoursPratique, deleteCoursPratique } from "@/lib/api";
import { useSession } from "@/hooks/use-session";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

const diffColors = {
  "Débutant": "bg-[#E8F5E9] text-primary",
  "Intermédiaire": "bg-[#FFF3E0] text-accent",
  "Avancé": "bg-[#FFEBEE] text-destructive"
};

const mapDifficulteFromBackend = (diff: string): string => {
  const mapping: Record<string, string> = {
    'debutant': 'Débutant',
    'intermediaire': 'Intermédiaire',
    'avance': 'Avancé',
  };
  return mapping[diff] || diff;
};

const EFriProjects = () => {
  const { user } = useSession();
  const { toast } = useToast();
  
  // ✅ HIGHLIGHT depuis URL
  const [searchParams, setSearchParams] = useSearchParams();
  const highlightId = searchParams.get("highlight");
  const highlightedRef = useRef<HTMLDivElement>(null);
  const [flashId, setFlashId] = useState<string | null>(null);
  
  const [filter, setFilter] = useState("Tous");
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [cours, setCours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  const [newCours, setNewCours] = useState({
    titre: "",
    description: "",
    difficulte: "Débutant",
    stack: "",
    apis: "",
    zipUrl: "",
    liens: [{ label: "", url: "" }]
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const isAdmin = user?.role === "admin";
  const filtered = filter === "Tous" ? cours : cours.filter(p => p.difficulte === filter);

  const asArray = (val: any) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') return val.split(',').map((s) => s.trim()).filter(Boolean);
    return [];
  };

  // Charger les cours pratiques
  useEffect(() => {
    async function fetchCours() {
      setLoading(true);
      try {
        const data = await getCoursPratiques();
        const transformedData = data.map((c: any) => ({
          ...c,
          difficulte: mapDifficulteFromBackend(c.difficulte),
        }));
        setCours(transformedData);
      } catch (err) {
        toast({ title: "Erreur", description: "Impossible de charger les cours pratiques.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    fetchCours();
  }, []);

  // ✅ SCROLL + FLASH quand highlight présent
  useEffect(() => {
    if (highlightId && cours.length > 0) {
      setFlashId(highlightId);

      const timer = setTimeout(() => {
        if (highlightedRef.current) {
          highlightedRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 300);

      const clearTimer = setTimeout(() => {
        setFlashId(null);
        searchParams.delete("highlight");
        setSearchParams(searchParams, { replace: true });
      }, 4000);

      return () => {
        clearTimeout(timer);
        clearTimeout(clearTimer);
      };
    }
  }, [highlightId, cours]);

  const handleAddLink = () => {
    setNewCours({
      ...newCours,
      liens: [...newCours.liens, { label: "", url: "" }]
    });
  };

  const handleRemoveLink = (index: number) => {
    const updatedLinks = newCours.liens.filter((_, i) => i !== index);
    setNewCours({ ...newCours, liens: updatedLinks });
  };

  const handleLinkChange = (index: number, field: "label" | "url", value: string) => {
    const updatedLinks = [...newCours.liens];
    updatedLinks[index][field] = value;
    setNewCours({ ...newCours, liens: updatedLinks });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.endsWith(".zip")) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Format invalide",
          description: "Veuillez sélectionner un fichier .zip",
          variant: "destructive"
        });
      }
    }
  };

  const trackDownload = () => {
    if (!user?.email) return;
    const key = `unilib_download_count_${user.email}`;
    const count = parseInt(localStorage.getItem(key) || "0");
    localStorage.setItem(key, (count + 1).toString());
  };

  const handleAddCours = async () => {
    if (!newCours.titre || !newCours.description) {
      toast({
        title: "Champs manquants",
        description: "Veuillez remplir au moins le titre et la description.",
        variant: "destructive"
      });
      return;
    }

    const formData = new FormData();
    formData.append("titre", newCours.titre);
    formData.append("description", newCours.description);
    
    const diffMap: Record<string, string> = {
      "Débutant": "debutant",
      "Intermédiaire": "intermediaire",
      "Avancé": "avance"
    };
    formData.append("difficulte", diffMap[newCours.difficulte] || "debutant");

    formData.append("stack", JSON.stringify(asArray(newCours.stack)));
    formData.append("apis", JSON.stringify(asArray(newCours.apis)));
    formData.append("etapes", JSON.stringify(["Consulter le support de cours PDF", "Réaliser les exercices pratiques"]));
    formData.append("liens", JSON.stringify(newCours.liens.filter(l => l.url !== "")));
    if (selectedFile) formData.append("fichier_zip", selectedFile);

    try {
      const added = await uploadCoursPratique(formData);
      setCours([added, ...cours]);
      toast({ title: "Cours ajouté", description: "Le nouveau cours pratique a été publié avec succès." });
      setNewCours({ titre: "", description: "", difficulte: "Débutant", stack: "", apis: "", zipUrl: "", liens: [{ label: "", url: "" }] });
      setSelectedFile(null);
      setIsAdding(false);
    } catch (err: any) {
      toast({ title: "Erreur", description: "Échec de l'ajout du cours pratique.", variant: "destructive" });
      if (err?.response) {
        console.error("Backend error:", err.response.data);
      } else {
        console.error("Upload error:", err);
      }
    }
  };

  const handleDeleteCours = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm("Voulez-vous vraiment supprimer ce cours pratique ?")) return;
    
    try {
      await deleteCoursPratique(id);
      setCours(prev => prev.filter((c: any) => c.id !== id));
      
      toast({
        title: "Cours supprimé",
        description: "Le support de cours pratique a été retiré.",
      });
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le cours.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setNewCours({
      titre: "",
      description: "",
      difficulte: "Débutant",
      stack: "",
      apis: "",
      zipUrl: "",
      liens: [{ label: "", url: "" }]
    });
    setSelectedFile(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] pb-20 lg:pb-0 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex-1 min-w-[280px]">
        <h1 className="font-poppins font-semibold text-2xl text-foreground">Cours Pratiques</h1>
        <p className="font-inter text-sm text-muted-foreground mt-1">
          Approfondissez vos connaissances par des exercices et applications concrètes
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {["Tous", "Débutant", "Intermédiaire", "Avancé"].map(d => (
            <button key={d} onClick={() => setFilter(d)} className={`px-3 py-1.5 flex-1 sm:flex-none rounded-full font-inter text-xs font-medium transition-colors ${filter === d ? "bg-secondary text-secondary-foreground" : "bg-muted text-foreground"}`}>{d}</button>
          ))}
        </div>

        {isAdmin && (
          <Dialog open={isAdding} onOpenChange={(open) => { setIsAdding(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <button className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-inter text-sm font-medium hover:opacity-90 transition-all">
                <Plus size={16} /> Ajouter un cours
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* ... Form content (unchanged) ... */}
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 pt-8">
        {filtered.map(p => (
          <Dialog key={p.id}>
            <DialogTrigger asChild>
              <div
                ref={String(p.id) === highlightId ? highlightedRef : null} // ✅ Scroll target
                className={`bg-background rounded-xl border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-500 overflow-hidden cursor-pointer group ${
                  String(p.id) === flashId
                    ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30 ring-2 ring-purple-500/50 shadow-lg shadow-purple-500/20" // ✅ Flash effect
                    : "border-border"
                }`}
                onClick={() => setSelectedProject(p)}
              >
                {/* Banner */}
                <div className="h-40 bg-secondary/5 flex items-center justify-center transition-colors group-hover:bg-secondary/10">
                  <FolderArchive size={48} className="text-secondary/40" />
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-inter font-medium ${diffColors[p.difficulte as keyof typeof diffColors]}`}>{p.difficulte}</span>
                  </div>
                  <h3 className="font-poppins font-semibold text-base text-foreground mb-1 group-hover:text-secondary transition-colors">{p.titre}</h3>
                  <p className="font-inter text-xs text-muted-foreground mb-4 line-clamp-2">{p.description}</p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {asArray(p.stack).slice(0, 3).map((t: string) => (
                      <span key={t} className="px-2 py-0.5 rounded-full bg-muted text-[10px] font-inter text-foreground">{t}</span>
                    ))}
                    {asArray(p.stack).length > 3 && <span className="text-[10px] text-muted-foreground font-inter">+{asArray(p.stack).length - 3}</span>}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <span className="font-inter text-[11px] text-muted-foreground">Support disponible</span>
                    <div className="flex items-center gap-2">
                      {isAdmin && (
                        <button
                          onClick={(e) => handleDeleteCours(p.id, e)}
                          className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded hover:bg-destructive/5"
                          title="Supprimer ce cours"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                      <div className="flex items-center gap-1 text-secondary font-medium text-[11px]">
                        <span>Consulter</span>
                        <ArrowRight size={12} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </DialogTrigger>

            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* ... Modal content (unchanged) ... */}
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  );
};

export default EFriProjects;