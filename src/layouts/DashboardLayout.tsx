import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, BookOpen, FolderKanban, Calendar, Bot, Upload, Settings, LogOut, Search, Bell, Menu, X, CheckCircle2, AlertCircle, Info, ArrowLeft } from "lucide-react";
import EFriLogo from "@/components/EFriLogo";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useSession } from "@/hooks/use-session";
import { getNotifications, markNotificationRead } from "@/lib/api";

const navItems = [
  { label: "Tableau de bord", icon: LayoutDashboard, path: "/e-fri/dashboard" },
  { label: "Ressources", icon: BookOpen, path: "/e-fri/ressources" },
  { label: "Cours Pratiques", icon: FolderKanban, path: "/e-fri/cours-pratiques" },
  { label: "Emploi du Temps", icon: Calendar, path: "/e-fri/emploi-du-temps" },
  { label: "IA Assistant", icon: Bot, path: "/e-fri/ia" },
  { label: "Téléverser", icon: Upload, path: "/e-fri/televerser", roles: ["responsable", "admin"] },
  { 
    label: "Administration", 
    icon: Settings, 
    path: import.meta.env.VITE_API_URL 
      ? `${import.meta.env.VITE_API_URL.replace('/api', '')}/admin` 
      : "http://127.0.0.1:8000/admin",
    roles: ["admin"], 
    external: true 
  },
  { label: "Paramètres", icon: Settings, path: "/e-fri/profil" },
];

const DashboardLayout = () => {
  const { user, logout } = useSession();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [globalSearch, setGlobalSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // ✅ RECHERCHE GLOBALE
  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalSearch.trim()) {
      navigate(`/e-fri/search?q=${encodeURIComponent(globalSearch.trim())}`);
      setGlobalSearch("");
    }
  };

// Dans le composant
useEffect(() => {
  const loadNotifs = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  loadNotifs();
  const interval = setInterval(loadNotifs, 30000); // 30s
  return () => clearInterval(interval);
}, []);

const markAsRead = async (id: number) => {
  try {
    await markNotificationRead(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  } catch (error) {
    console.error('Error:', error);
  }
};

  const handleLogout = () => {
    logout();
    navigate("/e-fri/connexion", { replace: true });
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-muted/30 relative">
      <div className={`flex min-h-screen transition-all duration-300 ${showLogoutConfirm ? "blur-md scale-[0.98] pointer-events-none" : ""}`}>
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-[260px] bg-background border-r border-border flex flex-col transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="p-5 border-b border-border flex items-center justify-between">
            <EFriLogo size="md" />
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* User info */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-poppins font-bold text-sm">
                {user?.prenom?.[0]}{user?.nom?.[0]}
              </div>
              <div>
                <p className="font-poppins font-semibold text-sm text-foreground">{user?.prenom} {user?.nom}</p>
                <span className="inline-block px-2 py-0.5 rounded text-[11px] font-inter bg-[#E3F2FD] text-secondary">{user?.filiere}</span>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 py-3 px-3 space-y-1 overflow-y-auto">
            {navItems
              .filter(item => !item.roles || (user?.role && item.roles.includes(user.role)))
              .map((item) => {
                const linkProps = {
                  key: item.path,
                  onClick: () => setSidebarOpen(false),
                  className: `flex items-center gap-3 px-3 py-2.5 rounded-lg font-inter text-sm transition-colors ${isActive(item.path)
                    ? "bg-[#E3F2FD] text-secondary border-l-[3px] border-secondary font-medium"
                    : "text-foreground hover:bg-muted"
                    }`
                };

                if (item.external) {
                  return (
                    <a
                    key={item.path}
                      {...linkProps}
                      href={item.path}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <item.icon size={18} />
                      {item.label}
                    </a>
                  );
                }

                return (
                  <Link
                  key={item.path}
                    {...linkProps}
                    to={item.path}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
          </nav>

          {/* Logout */}
          <div className="p-3 border-t border-border">
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-inter text-sm text-destructive hover:bg-destructive/10 w-full transition-colors"
            >
              <LogOut size={18} />
              Déconnexion
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Header */}
          <header className="sticky top-0 z-30 h-16 bg-background border-b border-border flex items-center px-4 lg:px-8 gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-foreground">
              <Menu size={22} />
            </button>

            <button
              onClick={() => navigate(-1)}
              className="lg:hidden flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors ml-1"
            >
              <ArrowLeft size={18} />
            </button>

            <button
              onClick={() => navigate(-1)}
              className="hidden lg:flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors font-inter text-sm"
            >
              <ArrowLeft size={16} />
              <span>Retour</span>
            </button>

            <div className="hidden lg:block font-inter text-sm text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
              e-FRI / <span className="text-foreground">{navItems.find(n => isActive(n.path))?.label || "Page"}</span>
            </div>

            {/* ✅ RECHERCHE GLOBALE */}
            <form onSubmit={handleGlobalSearch} className="flex-1 max-w-sm lg:max-w-md mx-auto px-2">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Rechercher partout..."
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background font-inter text-sm outline-none focus:border-secondary placeholder:text-muted-foreground"
                />
              </div>
            </form>

            <div className="flex items-center gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <button className="relative text-foreground hover:text-secondary transition-colors outline-none">
                    <Bell size={20} />
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent text-[10px] text-accent-foreground flex items-center justify-center font-bold animate-in zoom-in duration-300">
                        {notifications.length}
                      </span>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0 mr-4" align="end">
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <h4 className="font-poppins font-bold text-sm">Notifications</h4>
                    {notifications.length > 0 && (
                      <button 
                        onClick={async () => {
                          for (const n of notifications) {
                            await markNotificationRead(n.id);
                          }
                          setNotifications([]);
                        }}
                        className="text-[10px] font-bold text-secondary uppercase tracking-wider hover:underline"
                      >
                        Tout marquer comme lu
                      </button>
                    )}
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notif: any) => (
                        <div 
                          key={notif.id} 
                          onClick={() => markAsRead(notif.id)} 
                          className="p-4 border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer group"
                        >
                          <div className="flex gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              notif.type === 'success' ? 'bg-primary/10 text-primary' :
                              notif.type === 'warning' ? 'bg-accent/10 text-accent' : 
                              'bg-secondary/10 text-secondary'
                            }`}>
                              {notif.type === 'success' ? <CheckCircle2 size={16} /> :
                                notif.type === 'warning' ? <AlertCircle size={16} /> : 
                                <Info size={16} />}
                            </div>
                            <div className="space-y-1">
                              <p className="font-poppins font-semibold text-xs text-foreground leading-tight group-hover:text-secondary transition-colors">
                                {notif.titre}
                              </p>
                              <p className="font-inter text-[11px] text-muted-foreground line-clamp-2">
                                {notif.message}
                              </p>
                              <p className="font-inter text-[9px] text-muted-foreground font-bold uppercase">
                                {new Date(notif.created_at).toLocaleString('fr-FR')}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <p className="font-inter text-xs text-muted-foreground italic">
                          Aucune notification
                        </p>
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              <div className="flex items-center gap-2">
                <Link to="/e-fri/profil" className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-poppins font-bold text-xs hover:ring-2 hover:ring-secondary/20 transition-all">
                  {user?.prenom?.[0]}{user?.nom?.[0]}
                </Link>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8">
            <Outlet />
          </main>
        </div>

        {/* Mobile bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border flex lg:hidden">
          {navItems
            .filter(item => !item.roles || (user?.role && item.roles.includes(user.role)))
            .slice(0, 5)
            .map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex-1 flex flex-col items-center py-2 text-[10px] font-inter ${isActive(item.path) ? "text-secondary" : "text-muted-foreground"
                  }`}
              >
                <item.icon size={20} />
                <span className="mt-0.5">{item.label.split(" ")[0]}</span>
              </Link>
            ))}
        </nav>
      </div>

      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent className="max-w-[400px] rounded-2xl border-border animate-in fade-in zoom-in duration-300">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-poppins font-bold text-xl flex items-center gap-2">
              <LogOut className="text-destructive" size={20} />
              Déconnexion
            </AlertDialogTitle>
            <AlertDialogDescription className="font-inter text-muted-foreground pt-2">
              Êtes-vous sûr de vouloir vous déconnecter ? Vous devrez vous reconnecter pour accéder à votre espace personnel.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="rounded-xl font-inter border-border hover:bg-muted">Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 font-inter font-bold"
            >
              Se déconnecter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DashboardLayout;