import { useState, useEffect } from "react";
import { Users, BookOpen, Clock, Download, Check, X, TrendingUp, BarChart3, ShieldOff, UserCheck, UserX, Ban, Key, Copy, Trash2, Plus } from "lucide-react";
import { adminStats, contributionsEnAttente, resources, registeredUsers } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

const EFriAdmin = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [contributions, setContributions] = useState(contributionsEnAttente);
  const [users, setUsers] = useState<any[]>([]);
  const [codes, setCodes] = useState<{ code: string; createdAt: string; used: boolean }[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const loadUsers = () => {
      const stored = JSON.parse(localStorage.getItem("unilib_users") || "[]");
      const allUsers = [...registeredUsers];
      stored.forEach((u: any) => {
        if (!allUsers.find(x => x.email === u.email)) {
          allUsers.push(u);
        } else {
          const index = allUsers.findIndex(x => x.email === u.email);
          allUsers[index] = { ...allUsers[index], ...u };
        }
      });
      setUsers(allUsers);
    };
    loadUsers();

    const storedCodes = JSON.parse(localStorage.getItem("unilib_resp_codes") || "[]");
    setCodes(storedCodes);
  }, []);

  const updateUserStatus = (email: string, newStatus: string) => {
    const updatedUsers = users.map(u => u.email === email ? { ...u, status: newStatus } : u);
    setUsers(updatedUsers);

    // Persist to localStorage
    const stored = JSON.parse(localStorage.getItem("unilib_users") || "[]");
    const registered = registeredUsers.find(u => u.email === email);

    let newStored;
    if (stored.find((u: any) => u.email === email)) {
      newStored = stored.map((u: any) => u.email === email ? { ...u, status: newStatus } : u);
    } else if (registered) {
      newStored = [...stored, { ...registered, status: newStatus }];
    } else {
      newStored = stored;
    }
    localStorage.setItem("unilib_users", JSON.stringify(newStored));

    // If it's the current user, we should ideally also update session, 
    // but admin won't usually ban themselves.

    toast({
      title: "Statut mis à jour",
      description: `Le compte ${email} est désormais ${newStatus === 'active' ? 'actif' : newStatus === 'inactive' ? 'inactif' : 'banni'}.`,
    });
  };

  const handleApprove = (id: string) => {
    setContributions(c => c.filter(x => x.id !== id));
    toast({ title: "Approuvée", description: "La contribution a été publiée." });
  };

  const handleReject = (id: string) => {
    setContributions(c => c.filter(x => x.id !== id));
    toast({ title: "Rejetée", description: "La contribution a été supprimée." });
  };

  const generateCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const code = "RESP-" + Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    const newEntry = { code, createdAt: new Date().toLocaleDateString("fr-FR"), used: false };
    const updated = [newEntry, ...codes];
    setCodes(updated);
    localStorage.setItem("unilib_resp_codes", JSON.stringify(updated));
    toast({ title: "Code généré", description: `Code: ${code} — Partagez-le avec le responsable.` });
  };

  const deleteCode = (code: string) => {
    const updated = codes.filter(c => c.code !== code);
    setCodes(updated);
    localStorage.setItem("unilib_resp_codes", JSON.stringify(updated));
    toast({ title: "Code supprimé" });
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copié !", description: `Le code ${code} est dans le presse-papier.` });
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <h1 className="font-poppins font-semibold text-2xl text-foreground">Administration</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Utilisateurs", value: adminStats.utilisateurs.toLocaleString(), icon: Users, color: "text-secondary" },
          { label: "Ressources", value: adminStats.ressources.toLocaleString(), icon: BookOpen, color: "text-primary" },
          { label: "En attente", value: adminStats.contributionsEnAttente.toString(), icon: Clock, color: "text-accent" },
          { label: "Téléchargements", value: adminStats.telechargements.toLocaleString(), icon: Download, color: "text-secondary" },
        ].map(kpi => (
          <div key={kpi.label} className="bg-background rounded-xl border border-border p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="font-inter text-sm text-muted-foreground">{kpi.label}</span>
              <kpi.icon size={18} className={kpi.color} />
            </div>
            <p className="font-poppins font-bold text-2xl text-foreground">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-lg p-0.5 overflow-x-auto no-scrollbar">
        {[
          { id: "overview", label: "Vue d'ensemble" },
          { id: "moderation", label: `Modération (${contributions.length})` },
          { id: "users", label: "Utilisateurs" },
          { id: "resources", label: "Ressources" },
          { id: "codes", label: "Codes Responsable" },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 px-4 py-2 rounded-md font-inter text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}>{tab.label}</button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-background rounded-xl border border-border p-6 shadow-sm">
            <h3 className="font-poppins font-semibold text-base text-foreground mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-secondary" /> Activité utilisateurs
            </h3>
            <div className="space-y-3">
              {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((j, i) => {
                const width = [75, 90, 60, 85, 95, 40, 25][i];
                return (
                  <div key={j} className="flex items-center gap-3">
                    <span className="font-inter text-xs text-muted-foreground w-8">{j}</span>
                    <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-secondary rounded-full" style={{ width: `${width}%` }} />
                    </div>
                    <span className="font-inter text-xs text-muted-foreground w-8">{width}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-background rounded-xl border border-border p-6 shadow-sm">
            <h3 className="font-poppins font-semibold text-base text-foreground mb-4 flex items-center gap-2">
              <BarChart3 size={16} className="text-primary" /> Top ressources
            </h3>
            <div className="space-y-3">
              {resources.sort((a, b) => b.telechargements - a.telechargements).slice(0, 5).map((r, i) => (
                <div key={r.id} className="flex items-center gap-3 py-1">
                  <span className="font-poppins font-bold text-sm text-muted-foreground w-5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-inter text-sm text-foreground truncate">{r.titre}</p>
                    <p className="font-inter text-xs text-muted-foreground">{r.type}</p>
                  </div>
                  <span className="font-inter text-xs text-muted-foreground flex items-center gap-1">
                    <Download size={12} /> {r.telechargements}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Moderation */}
      {activeTab === "moderation" && (
        <div className="bg-background rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-inter text-xs text-muted-foreground font-medium">Titre</th>
                  <th className="text-left p-4 font-inter text-xs text-muted-foreground font-medium">Contributeur</th>
                  <th className="text-left p-4 font-inter text-xs text-muted-foreground font-medium">Type</th>
                  <th className="text-left p-4 font-inter text-xs text-muted-foreground font-medium">Filière</th>
                  <th className="text-left p-4 font-inter text-xs text-muted-foreground font-medium">Date</th>
                  <th className="text-right p-4 font-inter text-xs text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contributions.map(c => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                    <td className="p-4 font-inter text-sm text-foreground">{c.titre}</td>
                    <td className="p-4 font-inter text-sm text-muted-foreground">{c.contributeur}</td>
                    <td className="p-4"><span className="px-2 py-0.5 rounded text-[11px] font-inter font-medium bg-[#E3F2FD] text-secondary">{c.type}</span></td>
                    <td className="p-4 font-inter text-sm text-muted-foreground">{c.filiere}</td>
                    <td className="p-4 font-inter text-sm text-muted-foreground">{c.date}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleApprove(c.id)} className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"><Check size={14} /></button>
                        <button onClick={() => handleReject(c.id)} className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"><X size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {contributions.length === 0 && (
                  <tr><td colSpan={6} className="p-8 text-center font-inter text-sm text-muted-foreground">Aucune contribution en attente</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users */}
      {activeTab === "users" && (
        <div className="bg-background rounded-xl border border-border p-6 shadow-sm">
          <h3 className="font-poppins font-semibold text-base text-foreground mb-4">Gestion des utilisateurs</h3>
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-inter text-xs text-muted-foreground font-medium uppercase tracking-wider">Utilisateur</th>
                  <th className="text-left p-3 font-inter text-xs text-muted-foreground font-medium uppercase tracking-wider">Filière / Promo</th>
                  <th className="text-left p-3 font-inter text-xs text-muted-foreground font-medium uppercase tracking-wider">Rôle</th>
                  <th className="text-left p-3 font-inter text-xs text-muted-foreground font-medium uppercase tracking-wider">Statut</th>
                  <th className="text-right p-3 font-inter text-xs text-muted-foreground font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <div className="font-inter text-sm font-semibold text-foreground whitespace-nowrap">{u.nom} {u.prenom}</div>
                      <div className="font-inter text-[11px] text-muted-foreground">{u.email}</div>
                    </td>
                    <td className="p-3 font-inter text-xs text-muted-foreground whitespace-nowrap">{u.filiere} · {u.promotion}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-inter font-bold uppercase tracking-wider ${u.role === "admin" ? "bg-accent/15 text-accent" :
                        u.role === "responsable" ? "bg-primary/15 text-primary" : "bg-[#E3F2FD] text-secondary"
                        }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-inter font-bold flex items-center gap-1 w-fit ${u.status === "active" ? "bg-emerald-100 text-emerald-700" :
                        u.status === "banned" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"
                        }`}>
                        <div className={`w-1 h-1 rounded-full ${u.status === "active" ? "bg-emerald-500" :
                          u.status === "banned" ? "bg-red-500" : "bg-gray-500"
                          }`} />
                        {u.status === "active" ? "Actif" : (u.status === "banned" ? "Banni" : "Inactif")}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {u.status === "active" ? (
                          <button onClick={() => updateUserStatus(u.email, "inactive")} className="p-2 text-muted-foreground hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all" title="Désactiver">
                            <UserX size={16} />
                          </button>
                        ) : (
                          <button onClick={() => updateUserStatus(u.email, "active")} className="p-2 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Activer">
                            <UserCheck size={16} />
                          </button>
                        )}
                        {u.status !== "banned" ? (
                          <button onClick={() => updateUserStatus(u.email, "banned")} className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Bannir">
                            <Ban size={16} />
                          </button>
                        ) : (
                          <button onClick={() => updateUserStatus(u.email, "active")} className="p-2 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Débannir">
                            <ShieldOff size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Resources */}
      {activeTab === "resources" && (
        <div className="bg-background rounded-xl border border-border p-6 shadow-sm">
          <h3 className="font-poppins font-semibold text-base text-foreground mb-4">Gestion des ressources</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-inter text-xs text-muted-foreground font-medium">Titre</th>
                  <th className="text-left p-3 font-inter text-xs text-muted-foreground font-medium">Type</th>
                  <th className="text-left p-3 font-inter text-xs text-muted-foreground font-medium">Filière</th>
                  <th className="text-left p-3 font-inter text-xs text-muted-foreground font-medium">Téléch.</th>
                </tr>
              </thead>
              <tbody>
                {resources.map(r => (
                  <tr key={r.id} className="border-b border-border last:border-0">
                    <td className="p-3 font-inter text-sm text-foreground">{r.titre}</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded text-[11px] font-inter font-medium bg-[#E3F2FD] text-secondary">{r.type}</span></td>
                    <td className="p-3 font-inter text-sm text-muted-foreground">{r.filiere}</td>
                    <td className="p-3 font-inter text-sm text-muted-foreground">{r.telechargements}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Codes Responsable */}
      {activeTab === "codes" && (
        <div className="space-y-4">
          <div className="bg-background rounded-xl border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-poppins font-semibold text-base text-foreground flex items-center gap-2"><Key size={16} className="text-secondary" /> Codes d'invitation Responsable</h3>
                <p className="font-inter text-xs text-muted-foreground mt-1">Générez un code unique et partagez-le avec un futur responsable pour qu'il puisse créer son compte.</p>
              </div>
              <button
                onClick={generateCode}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground font-inter text-sm font-bold shadow-sm hover:opacity-90 transition-all active:scale-95 whitespace-nowrap"
              >
                <Plus size={16} /> Générer un code
              </button>
            </div>
          </div>

          <div className="bg-background rounded-xl border border-border shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-inter text-xs text-muted-foreground font-medium uppercase tracking-wider">Code</th>
                  <th className="text-left p-4 font-inter text-xs text-muted-foreground font-medium uppercase tracking-wider">Créé le</th>
                  <th className="text-left p-4 font-inter text-xs text-muted-foreground font-medium uppercase tracking-wider">Statut</th>
                  <th className="text-right p-4 font-inter text-xs text-muted-foreground font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {codes.map((c) => (
                  <tr key={c.code} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <code className="font-mono text-sm font-bold text-foreground tracking-widest">{c.code}</code>
                    </td>
                    <td className="p-4 font-inter text-sm text-muted-foreground">{c.createdAt}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-inter font-bold flex items-center gap-1 w-fit ${c.used ? "bg-gray-100 text-gray-500" : "bg-emerald-100 text-emerald-700"
                        }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${c.used ? "bg-gray-400" : "bg-emerald-500"}`} />
                        {c.used ? "Utilisé" : "Disponible"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {!c.used && (
                          <button onClick={() => copyCode(c.code)} className="p-2 text-muted-foreground hover:text-secondary hover:bg-secondary/10 rounded-lg transition-all" title="Copier">
                            <Copy size={14} />
                          </button>
                        )}
                        <button onClick={() => deleteCode(c.code)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all" title="Supprimer">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {codes.length === 0 && (
                  <tr><td colSpan={4} className="p-10 text-center font-inter text-sm text-muted-foreground">Aucun code généré pour l'instant.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default EFriAdmin;
