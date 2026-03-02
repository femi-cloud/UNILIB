import { useState, useEffect, useRef } from "react";
import { Download, Upload, FileText, X, Eye, Loader2, History, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { useSession } from "@/hooks/use-session";
import { useToast } from "@/hooks/use-toast";
import { getEmploiDuTempsActif, uploadEmploiDuTemps, deleteEmploiDuTemps, getEmploiDuTemps } from "@/lib/api";

const EFriSchedule = () => {
  const { user } = useSession();
  const { toast } = useToast();
  const [emploi, setEmploi] = useState<any>(null);
  const [historique, setHistorique] = useState<any[]>([]);
  const [showHistorique, setShowHistorique] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // États pour le viewer PDF
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pdfJsLoaded, setPdfJsLoaded] = useState(false);

  // ✅ CHARGER pdf.js DYNAMIQUEMENT
  useEffect(() => {
    const loadPdfJs = () => {
      if ((window as any).pdfjsLib) {
        setPdfJsLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.async = true;
      script.onload = () => {
        setPdfJsLoaded(true);
        console.log('✅ pdf.js chargé');
      };
      script.onerror = () => {
        console.error('❌ Erreur chargement pdf.js');
        toast({
          title: "Erreur",
          description: "Impossible de charger le lecteur PDF",
          variant: "destructive",
        });
      };
      document.head.appendChild(script);
    };

    loadPdfJs();
  }, [toast]);

  useEffect(() => {
    const fetchEmploi = async () => {
      setLoading(true);
      try {
        const [activeData, allData] = await Promise.all([
          getEmploiDuTempsActif(),
          getEmploiDuTemps(),
        ]);
        
        setEmploi(activeData);
        setHistorique(allData.filter((e: any) => !e.is_active));
      } catch (error) {
        console.error('Error fetching emploi:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmploi();
  }, []);

  // CHARGER PDF avec pdf.js
  useEffect(() => {
    if (!emploi?.fichier_pdf_url || !pdfJsLoaded) return;

    const loadPdf = async () => {
      try {
        const pdfjsLib = (window as any).pdfjsLib;
        if (!pdfjsLib) {
          console.error('pdf.js non disponible');
          return;
        }

        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        const loadingTask = pdfjsLib.getDocument(emploi.fichier_pdf_url);
        const pdf = await loadingTask.promise;
        
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
        setCurrentPage(1);
      } catch (error) {
        console.error('Erreur chargement PDF:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger le PDF",
          variant: "destructive",
        });
      }
    };

    loadPdf();
  }, [emploi?.fichier_pdf_url, pdfJsLoaded, toast]);

  // RENDER PAGE
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(currentPage);
        const canvas = canvasRef.current!;
        const context = canvas.getContext('2d')!;

        const viewport = page.getViewport({ scale });

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
      } catch (error) {
        console.error('Erreur render page:', error);
      }
    };

    renderPage();
  }, [pdfDoc, currentPage, scale]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast({
        title: "Format non supporté",
        description: "Veuillez téléverser un fichier PDF.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('titre', 'Emploi du temps officiel');
      formData.append('fichier_pdf', file);
      formData.append('is_active', 'true');

      const newEmploi = await uploadEmploiDuTemps(formData);
      
      if (emploi) {
        setHistorique([emploi, ...historique]);
      }
      
      setEmploi(newEmploi);

      toast({
        title: "Emploi du temps mis à jour",
        description: "Le nouveau document a été téléversé avec succès.",
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Erreur d'upload",
        description: error.message || "Impossible de téléverser le fichier.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removePdf = async () => {
    if (!emploi?.id) return;
    if (!confirm("Voulez-vous vraiment désactiver cet emploi du temps ?")) return;

    try {
      await deleteEmploiDuTemps(emploi.id);
      setHistorique([emploi, ...historique]);
      setEmploi(null);
      setPdfDoc(null);

      toast({
        title: "Emploi du temps désactivé",
        description: "Le document a été déplacé dans l'historique.",
      });
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de désactiver le fichier.",
        variant: "destructive",
      });
    }
  };

  const isAdmin = user?.role === "admin";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin h-12 w-12 text-primary" />
          <p className="font-inter text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-poppins font-semibold text-2xl text-foreground">Emploi du Temps</h1>
          <p className="font-inter text-sm text-muted-foreground mt-1">
            Planning officiel fourni par l'administration
          </p>
        </div>

        <div className="flex items-center gap-3">
          {emploi?.fichier_pdf_url && (
            <a
              href={emploi.fichier_pdf_url}
              download="Emploi_du_Temps.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground font-inter text-sm font-medium hover:opacity-90"
            >
              <Download size={16} /> Télécharger
            </a>
          )}

          {isAdmin && historique.length > 0 && (
            <button
              onClick={() => setShowHistorique(!showHistorique)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-foreground font-inter text-sm font-medium hover:bg-muted/80"
            >
              <History size={16} /> Historique ({historique.length})
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-inter text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Upload...
                </>
              ) : (
                <>
                  <Upload size={16} /> {emploi ? "Remplacer" : "Téléverser"}
                </>
              )}
            </button>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf"
            className="hidden"
          />
        </div>
      </div>

      {/* Historique */}
      {isAdmin && showHistorique && historique.length > 0 && (
        <div className="bg-background rounded-xl border border-border p-4">
          <h3 className="font-poppins font-semibold text-sm mb-3">Anciens emplois du temps</h3>
          <div className="space-y-2">
            {historique.map((h) => (
              <div key={h.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-inter text-sm font-medium">{h.titre}</p>
                  <p className="font-inter text-xs text-muted-foreground">
                    {new Date(h.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <a
                  href={h.fichier_pdf_url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90"
                >
                  Télécharger
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Affichage PDF */}
      <div className="bg-background rounded-2xl border border-border shadow-sm overflow-hidden min-h-[600px] flex flex-col">
        {emploi?.fichier_pdf_url ? (
          <div className="flex-1 flex flex-col">
            <div className="bg-muted/30 p-3 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <FileText size={18} className="text-primary" />
                <span>{emploi.titre || 'Emploi du temps officiel'}</span>
              </div>
              {isAdmin && (
                <button
                  onClick={removePdf}
                  className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                  title="Désactiver"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* VIEWER */}
            {pdfDoc ? (
              <>
                <div className="bg-muted/50 p-2 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                      className="p-2 rounded hover:bg-background disabled:opacity-50 transition-colors"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span className="font-inter text-xs font-medium px-2">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage >= totalPages}
                      className="p-2 rounded hover:bg-background disabled:opacity-50 transition-colors"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setScale(s => Math.max(0.5, s - 0.25))}
                      className="p-2 rounded hover:bg-background transition-colors"
                    >
                      <ZoomOut size={18} />
                    </button>
                    <span className="font-inter text-xs font-medium px-2">
                      {Math.round(scale * 100)}%
                    </span>
                    <button
                      onClick={() => setScale(s => Math.min(3, s + 0.25))}
                      className="p-2 rounded hover:bg-background transition-colors"
                    >
                      <ZoomIn size={18} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-auto bg-muted/10 flex items-start justify-center p-4">
                  <canvas
                    ref={canvasRef}
                    className="shadow-2xl border border-border/20 rounded-lg"
                  />
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="animate-spin h-8 w-8 text-primary" />
                  <p className="font-inter text-sm text-muted-foreground">Chargement du PDF...</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-6">
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center">
              <FileText size={30} className="text-muted-foreground/40" />
            </div>
            <div className="max-w-md space-y-2">
              <h3 className="font-poppins font-semibold text-xl text-foreground">Aucun emploi du temps</h3>
              <p className="font-inter text-sm text-muted-foreground">
                L'administration n'a pas encore publié d'emploi du temps.
              </p>
            </div>

            {isAdmin && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-inter text-sm font-bold shadow-lg hover:scale-105 transition-all"
              >
                <Upload size={18} /> Téléverser le planning
              </button>
            )}
          </div>
        )}
      </div>

      <div className="bg-secondary/5 rounded-xl border border-secondary/10 p-4 flex gap-4 items-start">
        <div className="p-2 bg-secondary/10 rounded-lg text-secondary flex-shrink-0">
          <Eye size={18} />
        </div>
        <div className="space-y-1">
          <h4 className="font-poppins font-semibold text-sm text-foreground">Information</h4>
          <p className="font-inter text-xs text-muted-foreground leading-relaxed">
            Le document PDF est visualisé directement dans votre navigateur. L'historique est conservé en base de données.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EFriSchedule;