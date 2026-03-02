import { useState, useEffect } from "react";
import { BookOpen, FolderKanban, Calendar, TrendingUp, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useSession } from "@/hooks/use-session";
import { getDashboardStats } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  total_resources: number;
  recent_resources: number;
  user_uploads: number;
  downloads_count: number;
  cours_count: number;
}

const EFriDashboard = () => {
  const { user } = useSession();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Charger les stats depuis l'API
  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error: any) {
        console.error('Error fetching stats:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les statistiques",
          variant: "destructive",
        });
        
        // Fallback vers les données locales
        setStats({
          total_resources: getLocalResourceCount(),
          recent_resources: getLocalRecentResourceCount(),
          user_uploads: 0,
          downloads_count: getLocalDownloadCount(),
          cours_count: getLocalCoursCount(),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  // Après le premier useEffect, ajoutez :
useEffect(() => {
  // Rafraîchir les stats toutes les 30 secondes
  const interval = setInterval(async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      // Silencieux en arrière-plan
    }
  }, 30000); // 30 secondes

  return () => clearInterval(interval);
}, [user]);

  // Fonctions fallback (localStorage) si l'API échoue
  const getLocalResourceCount = () => {
    const stored = JSON.parse(localStorage.getItem("unilib_resources") || "[]");
    return stored.length;
  };

  const getLocalRecentResourceCount = () => {
    const stored = JSON.parse(localStorage.getItem("unilib_resources") || "[]");
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return stored.filter((r: any) => {
      const parts = r.date.split('/');
      const d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      return d >= sevenDaysAgo;
    }).length;
  };

  const getLocalCoursCount = () => {
    const stored = JSON.parse(localStorage.getItem("unilib_cours") || "[]");
    return stored.length;
  };

  const getLocalDownloadCount = () => {
    if (!user?.email) return 0;
    const stored = localStorage.getItem(`unilib_download_count_${user.email}`) || "0";
    return parseInt(stored);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin h-12 w-12 text-primary" />
          <p className="font-inter text-sm text-muted-foreground">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Greeting */}
      <div>
        <h1 className="font-poppins font-semibold text-2xl text-foreground">
          Bienvenue, {user?.prenom || "Étudiant"} 👋
        </h1>
        <p className="font-inter text-sm text-muted-foreground mt-1">
          {user?.filiere} · {user?.promotion}
        </p>
      </div>

      {/* Widget cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-background rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
              <BookOpen size={20} className="text-secondary" />
            </div>
            <span className="font-inter text-sm text-muted-foreground">Ressources disponibles</span>
          </div>
          <p className="font-poppins font-bold text-2xl text-foreground">
            {stats?.total_resources || 0}
          </p>
          <p className="font-inter text-xs text-muted-foreground mt-1">
            {stats?.recent_resources || 0} nouvelles cette semaine
          </p>
        </div>

        <div className="bg-background rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FolderKanban size={20} className="text-primary" />
            </div>
            <span className="font-inter text-sm text-muted-foreground">Cours pratiques</span>
          </div>
          <p className="font-poppins font-bold text-2xl text-foreground">
            {stats?.cours_count || 0}
          </p>
          <p className="font-inter text-xs text-muted-foreground mt-1">supports disponibles</p>
        </div>

        <div className="bg-background rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Calendar size={20} className="text-accent" />
            </div>
            <span className="font-inter text-sm text-muted-foreground">Prochain cours</span>
          </div>
          <p className="font-poppins font-bold text-lg text-foreground">Planning en attente</p>
          <p className="font-inter text-xs text-muted-foreground mt-1">Consultez l'emploi du temps</p>
        </div>

        <div className="bg-background rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
              <TrendingUp size={20} className="text-secondary" />
            </div>
            <span className="font-inter text-sm text-muted-foreground">
              {user?.role === 'admin' || user?.role === 'responsable' ? 'Mes uploads' : 'Téléchargements'}
            </span>
          </div>
          <p className="font-poppins font-bold text-2xl text-foreground">
            {user?.role === 'admin' || user?.role === 'responsable' 
              ? (stats?.user_uploads || 0) 
              : (stats?.downloads_count || getLocalDownloadCount())}
          </p>
          <p className="font-inter text-xs text-muted-foreground mt-1">
            {user?.role === 'admin' || user?.role === 'responsable' ? 'ressources partagées' : 'total effectués'}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <section>
        <h2 className="font-poppins font-semibold text-lg text-foreground mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            to="/e-fri/ressources" 
            className="flex items-center justify-between p-4 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all hover:scale-[1.02]"
          >
            <span className="font-inter text-sm font-medium">Accéder aux ressources</span>
            <ArrowRight size={18} />
          </Link>
          
          <Link 
            to="/e-fri/cours-pratiques" 
            className="flex items-center justify-between p-4 rounded-xl bg-secondary text-secondary-foreground hover:opacity-90 transition-all hover:scale-[1.02]"
          >
            <span className="font-inter text-sm font-medium">Explorer les cours pratiques</span>
            <ArrowRight size={18} />
          </Link>
          
          {(user?.role === 'admin' || user?.role === 'responsable') && (
            <Link 
              to="/e-fri/televerser" 
              className="flex items-center justify-between p-4 rounded-xl bg-accent text-accent-foreground hover:opacity-90 transition-all hover:scale-[1.02]"
            >
              <span className="font-inter text-sm font-medium">Téléverser une ressource</span>
              <ArrowRight size={18} />
            </Link>
          )}
        </div>
      </section>

      {/* Activité récente (optionnel) */}
      {stats && stats.recent_resources > 0 && (
        <section>
          <h2 className="font-poppins font-semibold text-lg text-foreground mb-4">Activité récente</h2>
          <div className="bg-background rounded-xl border border-border p-5">
            <p className="font-inter text-sm text-muted-foreground">
              🎉 <span className="font-semibold text-foreground">{stats.recent_resources} nouvelles ressources</span> ont été ajoutées cette semaine !
            </p>
            <Link to="/e-fri/ressources" className="inline-flex items-center gap-2 mt-3 text-sm font-medium text-primary hover:underline">
              Voir toutes les ressources <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default EFriDashboard;