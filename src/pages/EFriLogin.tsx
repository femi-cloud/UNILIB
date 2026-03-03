import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { registeredUsers } from "@/data/mockData";
import UniLibLogo from "@/components/UniLibLogo";
import EFriLogo from "@/components/EFriLogo";
import { Button } from "@/components/ui/button";
import GoogleBtn from "@/components/ui/googleBtn";
import { Input } from "@/components/ui/input";
import {login, getCurrentUser } from '@/lib/api.ts';

const EFriLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const state = location.state as { error?: string };
    if (state?.error) {
      toast({
        title: "Session interrompue",
        description: state.error,
        variant: "destructive"
      });
    }
  }, [location, toast]);

  const validate = () => {
    const errs: typeof errors = {};
    if (!email) errs.email = "L'email est requis";
    if (!password) errs.password = "Le mot de passe est requis";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);

    try {
      // 1. Login API et récupération des tokens
      console.log('Tentative de connexion...', email);
      const loginData = await login(email.toLowerCase(), password);
      console.log('Login réussi, tokens stockés');
      
      // 2. Récupérer les infos utilisateur
      console.log('👤 Récupération des infos utilisateur...');
      const userData = await getCurrentUser();
      console.log('User data:', userData);
      
      // 3. Vérifier le statut
      if (userData.status && userData.status !== "active") {
        toast({
          title: "Accès refusé",
          description: userData.status === "banned" 
            ? "Votre compte a été banni par l'administration." 
            : "Votre compte est actuellement désactivé.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // 4. Stocker la session
      localStorage.setItem("unilib_session", JSON.stringify(userData));
      console.log('Session stockée');
      
      toast({ 
        title: "Connexion réussie", 
        description: `Ravi de vous revoir, ${userData.prenom} !` 
      });
      
      navigate("/e-fri/dashboard");
      
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Erreur de connexion",
        description: error.message || "Email ou mot de passe incorrect.",
        variant: "destructive"
      });
      setErrors({ email: "Identifiants invalides" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    toast({
      title: "Connexion Google",
      description: "Simulation de l'authentification Google en cours...",
    });
    setTimeout(() => {
      const user = registeredUsers[0]; // Marcel
      localStorage.setItem("unilib_session", JSON.stringify(user));
      navigate("/e-fri/dashboard");
      toast({ title: "Connecté via Google", description: `Bienvenue, ${user.prenom} !` });
    }, 1000);
  };

  return (
    <div className="min-h-screen flex bg-neutral-50">
      <div className="hidden relative lg:flex lg:w-[45%] items-center justify-center p-12">
        <div className="text-center">
          <div className="absolute top-4 left-4 p-8 flex flex-row items-center justify-center gap-6">
            <Link to="/">
              <UniLibLogo size="small" />
            </Link>            <div className="w-px bg-slate-300 h-10"></div>
            <Link to="/e-fri">
              <EFriLogo size="lg" />
            </Link>
          </div>
          <div className={`absolute w-[80%] max-w-[700px] aspect-square flex flex-col items-center justify-center left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2`}>
            <img src="/star.svg" alt="star" className="w-40 xl:w-60 absolute top-[25%] left-[-38%] xl:left-[-30%] animate-spin animate-duration-[8000ms]" />
            <img src="/star1.svg" alt="star" className="w-20 absolute top-[3%] right-[4%] animate-rotate-bounce" />
            <img src="/star2.svg" alt="star" className="w-20 absolute bottom-[3%] right-[10%] animate-spin animate-duration-[6000ms] animate-reverse" />
            <div className="flex flex-col items-center justify-center gap-3">
              <img src="/public/access-account.svg" alt="nigga-account" className="w-[30vw] max-w-[500px]" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:m-8 rounded-2xl shadow-md lg:p-12 bg-white">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <UniLibLogo size="small" />
          </div>
          <Link to="/e-fri" className="flex items-center gap-2 mb-8 lg:hidden hover:opacity-80 transition-opacity">
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
              <circle cx="16" cy="24" r="12" fill="#3D5AFE" opacity="0.85" />
              <circle cx="24" cy="24" r="12" fill="#FF9800" opacity="0.75" />
              <circle cx="20" cy="14" r="12" fill="#69F0AE" opacity="0.8" />
            </svg>
            <span className="font-poppins text-xl">
              <span className="font-medium text-muted-foreground">e-</span>
              <span className="font-bold text-foreground">FRI</span>
            </span>
          </Link>

          <h2 className="font-poppins font-bold text-2xl text- mb-1">Bienvenue sur e-FRI</h2>
          <p className="font-inter text-sm text-muted-foreground mb-8">Connectez-vous pour accéder à vos ressources</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="font-inter text-sm text-foreground mb-3 block">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required

                />
              </div>
              {errors.email && <p className="font-inter text-xs text-destructive mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="font-inter text-sm text-foreground mb-3 block">Mot de passe</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required

                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="font-inter text-xs text-destructive mt-1">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="w-4 h-4 rounded border-input accent-blue-500" />
                <span className="font-inter text-sm text-foreground">Se souvenir de moi</span>
              </label>
              <Link to="/e-fri/mot-de-passe-oublie" className="font-inter text-sm text-secondary hover:underline">Mot de passe oublié ?</Link>
            </div>

            <Button
              type="submit"
              className="w-full py-3 rounded-xl"
              variant="primary"
              disabled={loading}
            >
              {loading ? "Connexion..." : "Se connecter"}
            </Button>

            <GoogleBtn onClick={() => handleGoogleLogin()} />
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="font-inter text-xs text-muted-foreground">ou</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <p className="text-center font-inter text-sm text-muted-foreground">
            Pas encore de compte ?{" "}
            <Link to="/e-fri/inscription" className="text-secondary hover:underline font-medium">S'inscrire</Link>
          </p>
        </div>
      </div>
    </div >
  );
};

export default EFriLogin;
