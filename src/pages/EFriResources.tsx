import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom"; // ✅ Ajout pour highlight
import { Download, FileText, Grid, List, Search, Clock, Trash2, Loader2 } from "lucide-react";
import { useSession } from "@/hooks/use-session";
import { useToast } from "@/hooks/use-toast";
import { getResources, deleteResource } from "@/lib/api";

const typeColors: Record<string, string> = {
  Cours: "bg-[#E3F2FD] text-secondary",
  Examen: "bg-[#FFF3E0] text-accent",
  TD: "bg-[#E8F5E9] text-primary",
  TP: "bg-[#E8F5E9] text-[#66BB6A]",
  Rattrapage: "bg-[#FFF3E0] text-accent",
  Correction: "bg-[#E3F2FD] text-secondary",
};

const filieres = [
  "Tous", 
  "Genie Logiciel", 
  "Intelligence Artificielle", 
  "Securite Informatique", 
  "SEiot", 
  "Internet Multimedia"
];

const promotions = ["Tous", "L1", "L2", "L3"];
const semestres = ["Tous", "S1", "S2"];
const types = ["Tous", "Cours", "TD", "TP", "Examen", "Rattrapage", "Correction"];

const mapFiliereFromBackend = (filiere: string): string => {
  const mapping: Record<string, string> = {
    'toutes': 'Toutes',
    'genie_logiciel': 'Genie Logiciel',
    'intelligence_artificielle': 'Intelligence Artificielle',
    'securite_informatique': 'Securite Informatique',
    'seiot': 'SEiot',
    'internet_multimedia': 'Internet Multimedia',
  };
  return mapping[filiere] || filiere;
};

const mapPromotionFromBackend = (promotion: string): string => {
  return promotion.toUpperCase();
};

const mapTypeFromBackend = (type: string): string => {
  const mapping: Record<string, string> = {
    'cours': 'Cours',
    'td': 'TD',
    'tp': 'TP',
    'examen': 'Examen',
    'rattrapage': 'Rattrapage',
    'correction': 'Correction',
  };
  return mapping[type] || type;
};

const EFriResources = () => {
  const { user } = useSession();
  const { toast } = useToast();
  
  // ✅ HIGHLIGHT depuis URL
  const [searchParams, setSearchParams] = useSearchParams();
  const highlightId = searchParams.get("highlight");
  const highlightedRef = useRef<HTMLDivElement>(null);
  const [flashId, setFlashId] = useState<string | null>(null);
  
  const [filiere, setFiliere] = useState("Tous");
  const [promotion, setPromotion] = useState("Tous");
  const [semestre, setSemestre] = useState("Tous");
  const [typeFilter, setTypeFilter] = useState("Tous");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  const [allResources, setAllResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isAdmin = user?.role === "admin";

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput.trim());
  };

  // CHARGER LES RESSOURCES
  useEffect(() => {
    const fetchResources = async () => {
      if (searchQuery) {
        setIsSearching(true);
      } else {
        setLoading(true);
      }
      
      setError(null);
      
      try {
        const data = await getResources({
          filiere: filiere !== "Tous" ? filiere : undefined,
          promotion: promotion !== "Tous" ? promotion : undefined,
          semestre: semestre !== "Tous" ? semestre : undefined,
          type: typeFilter !== "Tous" ? typeFilter : undefined,
          search: searchQuery || undefined,
        });
        
        const transformedData = data.map((r: any) => ({
          id: r.id,
          titre: r.titre,
          matiere: r.matiere,
          filiere: mapFiliereFromBackend(r.filiere),
          promotion: mapPromotionFromBackend(r.promotion),
          semestre: `S${r.semestre}`,
          type: mapTypeFromBackend(r.type_ressource),
          date: new Date(r.created_at).toLocaleDateString('fr-FR'),
          format: (r.fichier_url || r.fichier || '').split('.').pop()?.toUpperCase() || "PDF",
          fileUrl: r.fichier_url || r.fichier || '',
          description: r.description || "",
          uploaded_by: r.uploaded_by,
        }));
        
        setAllResources(transformedData);
      } catch (err: any) {
        console.error('Error fetching resources:', err);
        setError(err.message);
        toast({
          title: "Erreur",
          description: "Impossible de charger les ressources",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
        setIsSearching(false);
      }
    };

    if (user) {
      fetchResources();
    }
  }, [user, filiere, promotion, semestre, typeFilter, searchQuery, toast]);

  // ✅ SCROLL + FLASH quand highlight présent
  useEffect(() => {
    if (highlightId && allResources.length > 0) {
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
  }, [highlightId, allResources]);

  // TÉLÉCHARGEMENT (CODE ORIGINAL INTACT)
  const trackDownload = () => {
    if (!user?.email) return;
    const key = `unilib_download_count_${user.email}`;
    const count = parseInt(localStorage.getItem(key) || "0");
    localStorage.setItem(key, (count + 1).toString());
  };

  const handleDownload = (r: any) => {
    trackDownload();
    
    const link = document.createElement("a");
    link.href = r.fileUrl;
    link.download = `${r.titre}.${r.format.toLowerCase()}`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Téléchargement",
      description: `${r.titre} en cours de téléchargement...`,
    });
  };

  // SUPPRESSION
  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette ressource ?")) return;
    
    try {
      await deleteResource(id);
      setAllResources(prev => prev.filter(r => r.id !== id));
      
      toast({
        title: "Ressource supprimée",
        description: "Le document a été retiré de la bibliothèque.",
      });
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la ressource.",
        variant: "destructive"
      });
    }
  };

  const selectClass = "px-3 py-2 rounded-lg border border-border bg-background font-inter text-sm outline-none focus:border-secondary transition-all";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="font-inter text-sm text-muted-foreground">Chargement des ressources...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-destructive font-inter text-sm">Erreur : {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-inter text-sm hover:opacity-90"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Filters */}
      <div className="bg-background rounded-xl border border-border p-4 shadow-sm lg:sticky lg:top-16 z-20 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-3">
          <select value={filiere} onChange={e => setFiliere(e.target.value)} className={selectClass}>
            {filieres.map(f => <option key={f}>{f}</option>)}
          </select>
          
          <select value={promotion} onChange={e => setPromotion(e.target.value)} className={selectClass}>
            {promotions.map(p => <option key={p}>{p}</option>)}
          </select>
          
          <select value={semestre} onChange={e => setSemestre(e.target.value)} className={selectClass}>
            {semestres.map(s => <option key={s}>{s}</option>)}
          </select>
          
          <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-0 sm:col-span-2 lg:col-span-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-10 py-2 rounded-lg border border-border bg-background font-inter text-sm outline-none focus:border-secondary shadow-inner"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              </div>
            )}
          </form>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto no-scrollbar">
            {types.map(t => (
              <button 
                key={t} 
                onClick={() => setTypeFilter(t)} 
                className={`px-4 py-1.5 rounded-lg border font-inter text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                  typeFilter === t 
                    ? "bg-secondary border-secondary text-secondary-foreground shadow-md shadow-secondary/20" 
                    : "bg-background border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          
          <div className="flex gap-1 bg-muted/50 p-1 rounded-lg self-end sm:self-auto">
            <button 
              onClick={() => setViewMode("grid")} 
              className={`p-1.5 rounded ${viewMode === "grid" ? "bg-background text-secondary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Grid size={16} />
            </button>
            <button 
              onClick={() => setViewMode("list")} 
              className={`p-1.5 rounded ${viewMode === "list" ? "bg-background text-secondary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="font-inter text-sm text-muted-foreground">
          <span className="font-bold text-foreground">{allResources.length}</span> document{allResources.length > 1 ? 's' : ''} trouvé{allResources.length > 1 ? 's' : ''}
          {searchQuery && (
            <span className="ml-2 text-xs">
              pour "<span className="font-semibold">{searchQuery}</span>"
            </span>
          )}
        </p>
      </div>

      {allResources.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-3">
          <FileText size={48} className="text-muted-foreground opacity-30" />
          <p className="font-inter text-sm text-muted-foreground">Aucune ressource disponible</p>
          <p className="font-inter text-xs text-muted-foreground opacity-60">
            Essayez de modifier vos filtres ou attendez que de nouvelles ressources soient ajoutées.
          </p>
        </div>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5" : "space-y-3"}>
          {allResources.map(r => (
            <div 
              key={r.id}
              ref={r.id === highlightId ? highlightedRef : null} // ✅ Scroll target
              className={`group bg-background rounded-xl border overflow-hidden hover:border-secondary hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 ${
                r.id === flashId
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 ring-2 ring-blue-500/50 shadow-lg shadow-blue-500/20" // ✅ Flash effect
                  : "border-border"
              }`}
            >
              <div className="p-4 space-y-4">
                <div className="flex items-start gap-3">
                  <div className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm ${
                    typeColors[r.type as keyof typeof typeColors] || "bg-muted text-muted-foreground"
                  }`}>
                    <FileText size={22} strokeWidth={2.5} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.1em]">
                        {r.matiere}
                      </span>
                    </div>
                    <h3 className="font-poppins font-semibold text-sm text-foreground line-clamp-2 leading-snug group-hover:text-secondary transition-colors">
                      {r.titre}
                    </h3>
                    <p className="font-inter text-[10px] text-muted-foreground mt-1">
                      {r.filiere} · {r.promotion} · {r.semestre}
                    </p>
                  </div>
                  
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/5"
                      title="Supprimer la ressource"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <div className="flex items-center gap-3">
                    <span className="font-inter text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                      <Clock size={12} /> {r.date}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                      typeColors[r.type as keyof typeof typeColors] || "bg-muted text-muted-foreground"
                    }`}>
                      {r.type}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDownload(r)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/10 text-secondary hover:bg-secondary hover:text-secondary-foreground transition-all duration-300 font-inter text-[11px] font-bold"
                  >
                    <Download size={14} /> Télécharger
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EFriResources;