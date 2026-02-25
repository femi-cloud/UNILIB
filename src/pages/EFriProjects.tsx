import { useState, useEffect } from "react";
import { FolderArchive, Cpu, Zap, Link as LinkIcon, Download, Info, ArrowRight, Plus, X, Trash2 } from "lucide-react";
import { getCoursPratiques, uploadCoursPratique } from "@/lib/api";
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


  // Mapping backend → frontend pour la difficulté
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
  const [filter, setFilter] = useState("Tous");
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [cours, setCours] = useState([]);
  const [loading, setLoading] = useState(true);
    // Charger les cours pratiques depuis l’API
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
  const [isAdding, setIsAdding] = useState(false);

  // Form state for new course
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

  // Defensive helpers: older/localStorage data may have `stack`, `apis`, `etapes` as strings
  const asArray = (val: any) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') return val.split(',').map((s) => s.trim()).filter(Boolean);
    return [];
  };

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
    
    // CORRECTION : Mapping de la difficulté pour correspondre aux choix du modèle Django
    // Backend attend : 'debutant', 'intermediaire', 'avance'
    const diffMap: Record<string, string> = {
      "Débutant": "debutant",
      "Intermédiaire": "intermediaire",
      "Avancé": "avance"
    };
    formData.append("difficulte", diffMap[newCours.difficulte] || "debutant");

    // Send all JSON fields as stringified JSON
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
      toast({ title: "Erreur", description: "Échec de l’ajout du cours pratique.", variant: "destructive" });
      // Log backend error response for debugging
      if (err?.response) {
        console.error("Backend error:", err.response.data);
        toast({ title: "Upload failed", description: `Backend error: ${JSON.stringify(err.response.data)}` });
      } else {
        console.error("Upload error:", err);
        toast({ title: "Upload failed", description: "An error occurred while uploading." });
      }
    }
  };

  const handleDeleteCours = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = cours.filter((c: any) => c.id !== id);
    setCours(updated);
    localStorage.setItem("unilib_cours", JSON.stringify(updated));
    toast({
      title: "Cours supprimé",
      description: "Le support de cours pratique a été retiré.",
    });
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
              <DialogHeader>
                <DialogTitle>Nouveau Cours Pratique</DialogTitle>
                <DialogDescription>
                  Remplissez les informations pour publier un nouveau support pratique.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Titre du cours</label>
                    <input
                      className="w-full px-3 py-2 rounded-md border border-input bg-background"
                      placeholder="Ex: Programmation Mobile React Native"
                      value={newCours.titre}
                      onChange={e => setNewCours({ ...newCours, titre: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Difficulté</label>
                    <select
                      className="w-full px-3 py-2 rounded-md border border-input bg-background"
                      value={newCours.difficulte}
                      onChange={e => setNewCours({ ...newCours, difficulte: e.target.value })}
                    >
                      <option>Débutant</option>
                      <option>Intermédiaire</option>
                      <option>Avancé</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    className="w-full px-3 py-2 rounded-md border border-input bg-background min-h-[80px]"
                    placeholder="Résumé du cours..."
                    value={newCours.description}
                    onChange={e => setNewCours({ ...newCours, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Technologies (séparées par des virgules)</label>
                    <input
                      className="w-full px-3 py-2 rounded-md border border-input bg-background"
                      placeholder="React, Expo..."
                      value={newCours.stack}
                      onChange={e => setNewCours({ ...newCours, stack: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Modules / APIs (séparés par des virgules)</label>
                    <input
                      className="w-full px-3 py-2 rounded-md border border-input bg-background"
                      placeholder="Firebase, MapBox..."
                      value={newCours.apis}
                      onChange={e => setNewCours({ ...newCours, apis: e.target.value })}
                    />
                  </div>
                </div>

                {/* Pack de cours upload */}
                <div className="space-y-2 p-4 border-2 border-dashed border-border rounded-xl bg-muted/30">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <FolderArchive size={16} className="text-secondary" /> Pack du cours (.zip)
                  </label>
                  <input
                    type="file"
                    accept=".zip"
                    className="hidden"
                    id="zip-upload"
                    onChange={handleFileChange}
                  />
                  <label
                    htmlFor="zip-upload"
                    className="flex flex-col items-center justify-center gap-2 py-4 cursor-pointer hover:bg-muted/50 transition-colors rounded-lg"
                  >
                    {selectedFile ? (
                      <div className="flex items-center gap-2 text-primary font-medium">
                        <Download size={20} />
                        <span>{selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                      </div>
                    ) : (
                      <>
                        <Plus className="text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Cliquez pour téléverser le fichier .zip</span>
                      </>
                    )}
                  </label>
                </div>

                {/* Dynamic Links */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold flex items-center gap-2">
                      <LinkIcon size={16} className="text-muted-foreground" /> Liens utiles
                    </label>
                    <button
                      onClick={handleAddLink}
                      className="text-xs text-secondary hover:underline flex items-center gap-1"
                    >
                      <Plus size={12} /> Ajouter un lien
                    </button>
                  </div>

                  <div className="space-y-2">
                    {newCours.liens.map((link, index) => (
                      <div key={index} className="flex gap-2 items-start">
                        <input
                          className="flex-1 px-3 py-1.5 rounded-md border border-input bg-background text-xs"
                          placeholder="Libellé (ex: Documentation)"
                          value={link.label}
                          onChange={(e) => handleLinkChange(index, "label", e.target.value)}
                        />
                        <input
                          className="flex-[2] px-3 py-1.5 rounded-md border border-input bg-background text-xs"
                          placeholder="URL (https://...)"
                          value={link.url}
                          onChange={(e) => handleLinkChange(index, "url", e.target.value)}
                        />
                        {newCours.liens.length > 1 && (
                          <button
                            onClick={() => handleRemoveLink(index)}
                            className="p-1.5 rounded hover:bg-destructive/10 text-destructive transition-colors"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <button
                  onClick={handleAddCours}
                  className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-inter font-semibold shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
                >
                  Publier le cours pratique
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 pt-8">
        {filtered.map(p => (
          <Dialog key={p.id}>
            <DialogTrigger asChild>
              <div
                className="bg-background rounded-xl border border-border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden cursor-pointer group"
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
              {selectedProject && (
                <>
                  <DialogHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-inter font-medium ${diffColors[selectedProject.difficulte as keyof typeof diffColors]}`}>
                        {selectedProject.difficulte}
                      </span>
                    </div>
                    <DialogTitle className="font-poppins text-2xl">{selectedProject.titre}</DialogTitle>
                    <DialogDescription className="font-inter text-sm pt-2">
                      {selectedProject.description}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6 py-4">
                    {/* Stack & APIs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="flex items-center gap-2 font-poppins font-semibold text-sm text-foreground">
                          <Cpu size={16} className="text-secondary" /> Concepts clés
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {asArray(selectedProject.stack).map((t: string) => (
                            <span key={t} className="px-2.5 py-1 rounded bg-secondary/10 text-secondary font-inter text-xs">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h4 className="flex items-center gap-2 font-poppins font-semibold text-sm text-foreground">
                          <Zap size={16} className="text-accent" /> Modules pratiques
                        </h4>
                        <ul className="space-y-1">
                          {asArray(selectedProject.apis).map((a: string) => (
                            <li key={a} className="font-inter text-xs text-muted-foreground flex items-center gap-2">
                              <div className="w-1 h-1 rounded-full bg-accent" /> {a}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Steps */}
                    <div className="bg-muted/50 rounded-xl p-5 space-y-3">
                      <h4 className="flex items-center gap-2 font-poppins font-semibold text-sm text-foreground">
                        <Info size={16} className="text-primary" /> Guide d'apprentissage
                      </h4>
                      <div className="space-y-3">
                        {asArray(selectedProject.etapes).map((e: string, i: number) => (
                          <div key={i} className="flex gap-3">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-background border border-border flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                              {i + 1}
                            </span>
                            <p className="font-inter text-xs text-foreground/80 leading-relaxed">{e}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Links */}
                    {selectedProject.liens && selectedProject.liens.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="flex items-center gap-2 font-poppins font-semibold text-sm text-foreground">
                          <LinkIcon size={16} className="text-muted-foreground" /> Liens utiles
                        </h4>
                        <div className="flex flex-wrap gap-4">
                          {selectedProject.liens.map((l: any) => (
                            <a
                              key={l.url}
                              href={l.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 font-inter text-xs text-secondary hover:underline"
                            >
                              {l.label} <ArrowRight size={10} className="-rotate-45" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action */}
<div className="pt-4">
  <button
    onClick={() => {
      trackDownload();
      
        // Utiliser fichier_zip_url du backend
        const zipUrl = selectedProject.fichier_zip;
        
        if (zipUrl) {
          // Ouvrir dans un nouvel onglet pour télécharger
          window.open(zipUrl, '_blank');
          
          toast({
            title: "Téléchargement démarré",
            description: "Le fichier ZIP est en cours de téléchargement.",
          });
        } else {
          toast({
            title: "Fichier non disponible",
            description: "Aucun pack de cours n'a été téléversé pour ce cours.",
            variant: "destructive",
          });
        }
      }}
      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-inter font-semibold shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity"
    >
      <Download size={18} /> Télécharger les ressources (.zip)
    </button>
    <p className="font-inter text-[10px] text-muted-foreground text-center mt-3">
      Contient les slides, les énoncés de TP et les corrigés de référence.
    </p>
  </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div >
  );
};

export default EFriProjects;
