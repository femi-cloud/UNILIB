import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, FileText, FolderArchive, Calendar, Loader2, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getResources, getCoursPratiques, getEmploiDuTemps } from "@/lib/api";

const EFriGlobalSearch = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const query = searchParams.get('q') || '';
  const [loading, setLoading] = useState(true);
  
  const [results, setResults] = useState({
    resources: [] as any[],
    cours: [] as any[],
    emploiTemps: [] as any[],
  });

  useEffect(() => {
    const searchAll = async () => {
      if (!query.trim()) {
        setLoading(false);
        return;
      }

      setLoading(true);
      
      try {
        const [resourcesData, coursData, emploiData] = await Promise.all([
          getResources({ search: query }).catch(() => []),
          getCoursPratiques().catch(() => []),
          getEmploiDuTemps().catch(() => []),
        ]);

        const filteredCours = coursData.filter((c: any) => 
          c.titre?.toLowerCase().includes(query.toLowerCase()) ||
          c.description?.toLowerCase().includes(query.toLowerCase()) ||
          c.stack?.some((s: string) => s.toLowerCase().includes(query.toLowerCase())) ||
          c.apis?.some((a: string) => a.toLowerCase().includes(query.toLowerCase()))
        );

        const filteredEmploi = emploiData.filter((e: any) => 
          e.titre?.toLowerCase().includes(query.toLowerCase())
        );

        setResults({
          resources: resourcesData,
          cours: filteredCours,
          emploiTemps: filteredEmploi,
        });
      } catch (error) {
        console.error('Search error:', error);
        toast({
          title: "Erreur de recherche",
          description: "Impossible d'effectuer la recherche",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    searchAll();
  }, [query, toast]);

  const totalResults = results.resources.length + results.cours.length + results.emploiTemps.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="font-inter text-sm text-muted-foreground">Recherche en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 lg:pb-0">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="font-poppins font-semibold text-2xl text-foreground">Résultats de recherche</h1>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Search size={16} />
          <p className="font-inter text-sm">
            {totalResults > 0 ? (
              <>
                <span className="font-bold text-foreground">{totalResults}</span> résultat{totalResults > 1 ? 's' : ''} pour "
                <span className="font-semibold text-foreground">{query}</span>"
              </>
            ) : (
              <>Aucun résultat pour "<span className="font-semibold text-foreground">{query}</span>"</>
            )}
          </p>
        </div>
      </div>

      {totalResults === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <Search size={64} className="text-muted-foreground opacity-20" />
          <p className="font-inter text-muted-foreground">Aucun résultat trouvé. Essayez d'autres mots-clés.</p>
        </div>
      ) : (
        <>
          {/* RESSOURCES */}
          {results.resources.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-poppins font-semibold text-lg text-foreground flex items-center gap-2">
                  <FileText size={20} className="text-secondary" />
                  Ressources ({results.resources.length})
                </h2>
                <button
                  onClick={() => navigate('/e-fri/ressources')}  
                  className="text-sm text-secondary hover:underline flex items-center gap-1"
                >
                  Voir tout <ArrowRight size={14} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {results.resources.slice(0, 6).map((r: any) => (
                  <div
                    key={r.id}
                    className="bg-background rounded-xl border border-border p-4 hover:border-secondary transition-all cursor-pointer"
                    onClick={() => navigate('/e-fri/ressources')}  
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                        <FileText size={20} className="text-secondary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-poppins font-semibold text-sm text-foreground line-clamp-1">
                          {r.titre}
                        </h3>
                        <p className="font-inter text-xs text-muted-foreground mt-1">
                          {r.matiere}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-muted text-foreground">
                            {r.type_ressource || 'Ressource'}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {r.filiere}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* COURS PRATIQUES */}
          {results.cours.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-poppins font-semibold text-lg text-foreground flex items-center gap-2">
                  <FolderArchive size={20} className="text-accent" />
                  Cours Pratiques ({results.cours.length})
                </h2>
                <button
                  onClick={() => navigate('/e-fri/cours-pratiques')}  
                  className="text-sm text-secondary hover:underline flex items-center gap-1"
                >
                  Voir tout <ArrowRight size={14} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {results.cours.slice(0, 6).map((c: any) => (
                  <div
                    key={c.id}
                    className="bg-background rounded-xl border border-border p-4 hover:border-secondary transition-all cursor-pointer"
                    onClick={() => navigate('/e-fri/cours-pratiques')}  
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <FolderArchive size={20} className="text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-poppins font-semibold text-sm text-foreground line-clamp-1">
                          {c.titre}
                        </h3>
                        <p className="font-inter text-xs text-muted-foreground mt-1 line-clamp-2">
                          {c.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-primary/10 text-primary">
                            {c.difficulte}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* EMPLOIS DU TEMPS */}
          {results.emploiTemps.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-poppins font-semibold text-lg text-foreground flex items-center gap-2">
                  <Calendar size={20} className="text-primary" />
                  Emplois du Temps ({results.emploiTemps.length})
                </h2>
                <button
                  onClick={() => navigate('/e-fri/emploi-du-temps')} 
                  className="text-sm text-secondary hover:underline flex items-center gap-1"
                >
                  Voir tout <ArrowRight size={14} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.emploiTemps.map((e: any) => (
                  <div
                    key={e.id}
                    className="bg-background rounded-xl border border-border p-4 hover:border-secondary transition-all cursor-pointer"
                    onClick={() => navigate('/e-fri/emploi-du-temps')}  
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Calendar size={20} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-poppins font-semibold text-sm text-foreground">
                          {e.titre}
                        </h3>
                        <p className="font-inter text-xs text-muted-foreground mt-1">
                          Ajouté le {new Date(e.created_at).toLocaleDateString('fr-FR')}
                        </p>
                        {e.is_active && (
                          <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] bg-green-100 text-green-700">
                            Actif
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default EFriGlobalSearch;