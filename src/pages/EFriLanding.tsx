import { Link } from "react-router-dom";
import { ArrowUpRight, Database, Clock, Users, Sparkles } from "lucide-react";
import EFriLogo from "@/components/EFriLogo";
import UniLibLogo from "@/components/UniLibLogo";

import duv from "@/assets/duvalier.png";
import duv1 from "@/assets/duvalier_1.png";

const stats = [
  { value: "500+", label: "ressources" },
  { value: "200+", label: "cours pratiques" },
  { value: "1000+", label: "étudiants actifs" },
  // { value: "50+", label: "enseignants" },
];

const features = [
  { icon: Database, color: "#2196F3", title: "Centralisation", description: "Tous vos cours, TDs, TPs et examens accessibles depuis un seul endroit." },
  { icon: Clock, color: "#4CAF50", title: "Gain de temps", description: "Trouvez rapidement ce dont vous avez besoin avec notre système de filtres avancés." },
  { icon: Users, color: "#FF9800", title: "Collaboration", description: "Partagez vos ressources et contribuez à enrichir la bibliothèque commune." },
  { icon: Sparkles, color: "#2196F3", title: "IA Intégrée", description: "Un assistant intelligent pour vous aider dans vos révisions et cours pratiques." },
];

import studentHero from "@/assets/student-efri.png";

const DotGrid = ({ color }: { color: string }) => (
  <div className="grid grid-cols-4 gap-[6px]">
    {Array.from({ length: 16 }).map((_, i) => (
      <div key={i} className="w-[5px] h-[5px] rounded-full" style={{ backgroundColor: color }} />
    ))}
  </div>
);

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const EFriLanding = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-6 lg:px-12">
          <div className="flex items-center gap-4">
            <UniLibLogo size="small" />
            <div className="w-px h-5 bg-border" />
            <Link to="/e-fri">
              <EFriLogo />
            </Link>
          </div>
          <nav className="hidden lg:flex items-center gap-8">
            <Link to="/e-fri" className="font-inter text-sm font-medium text-foreground">Accueil</Link>
            <Link to="/e-fri/ressources" className="font-inter text-sm text-muted-foreground hover:text-foreground transition-colors">Ressources</Link>
            <Link to="/e-fri/cours-pratiques" className="font-inter text-sm text-muted-foreground hover:text-foreground transition-colors">Cours Pratiques</Link>
            <Link to="/e-fri/emploi-du-temps" className="font-inter text-sm text-muted-foreground hover:text-foreground transition-colors">Emploi du Temps</Link>
            <Link to="/e-fri/ia" className="font-inter text-sm text-muted-foreground hover:text-foreground transition-colors">IA Assistant</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/e-fri/connexion">
              <Button variant="primary" className="py-3 rounded-xl bg-blue-600 shadow-blue-300/60 hover:shadow-blue-300/80">
                Se connecter
              </Button>
            </Link>
            <Link to="/e-fri/inscription">
              <Button variant="primary" className="py-3 rounded-xl">
                S'inscrire
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-background py-16 lg:py-24">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
              {/* Grille de points bleus — haut gauche */}
              <img src="/dots_top.svg" className="absolute z-10 top-16 left-10 w-16 hidden lg:flex" />
              <img src="/dots_bottom.svg" className="absolute z-10 bottom-10 right-10 w-16 hidden lg:flex" />

              {/* Left column - Text */}
              <div className="flex-1 lg:max-w-[55%] relative z-10 pt-12">
                <h1 className="font-poppins font-bold text-4xl lg:text-5xl text-foreground leading-tight mb-4 animate-in fade-in slide-in-from-left duration-700">
                  Votre bibliothèque académique centralisée
                </h1>
                <p className="font-inter text-sm text-muted-foreground mb-8 max-w-md leading-relaxed animate-in fade-in slide-in-from-left duration-700 delay-100">
                  Cours, TDs, TPs, examens et projets — tout ce dont vous avez besoin pour réussir à l'IFRI
                </p>
                <Link
                  to="/e-fri/connexion"
                >
                  <Button className="rounded-xl">
                    Accéder à la plateforme
                    <ArrowUpRight size={16} />
                  </Button>
                </Link>
              </div>

              {/* Right column - Photo + Decorative shapes */}
              <div className="flex-1 hidden relative h-[400px] lg:h-[630px] w-full max-w-[650px] lg:flex items-center justify-center ">
                <div className="relative w-[55vw] h-full flex flex-col items-end justify-center" >
                  <div className=" absolute z-40 top-[20%] left-[40%] w-[15%] max-w-[200px] aspect-square rounded-[100%] bg-[#D5FFC9] animate-hero-float-orange"></div>
                  <div className="relative w-[50%] max-w-[520px] aspect-square rounded-[20%] rotate-[35deg] overflow-x-clip">
                    <img
                      src={duv1}
                      alt="Duvalier"
                      className="absolute -rotate-[35deg] left-[13.24%] top-[-37.9%]" />
                    <div className="absolute w-full -rotate-[35deg] h-1/2 bg-white -bottom-[25%]"></div>
                    <div className="absolute bottom-[-30%] left-[20%] w-[55%] max-w-[300px] aspect-square rounded-[100%] border-2 border-[#FFA3A3]"></div>
                  </div>
                  <div className="absolute w-[50%] max-w-[520px] aspect-square rounded-[20%] rotate-[35deg] bg-[#758AFF] border-0 overflow-clip">
                    <img
                      src={duv}
                      alt="Duvalier"
                      className="absolute -rotate-[35deg] left-[20%] top-[-40%]" />
                    <div className="absolute bottom-[-30%] left-[20%] w-[55%] max-w-[300px] aspect-square rounded-[100%] bg-[#FFA3A3]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-stats py-12 lg:py-16">
          <div className="container mx-auto px-6 lg:px-12 flex flex-wrap justify-center gap-12 lg:gap-20">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-poppins font-bold text-4xl text-primary-foreground">{s.value}</div>
                <div className="font-inter text-sm text-primary-foreground mt-1 opacity-90">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="bg-background py-16 lg:py-20">
          <div className="container mx-auto px-6 lg:px-12">
            <h2 className="font-poppins font-bold text-2xl text-foreground text-center mb-12">Fonctionnalités</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((f) => (
                <div key={f.title} className="bg-card rounded-xl border border-border p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: f.color }}>
                    <f.icon size={24} className="text-primary-foreground" />
                  </div>
                  <h3 className="font-poppins font-semibold text-lg text-foreground mb-2">{f.title}</h3>
                  <p className="font-inter text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-8">
        <div className="container mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-4">
          <EFriLogo />
          <p className="font-inter text-xs text-muted-foreground">2026 ©Copyright IFRI-UAC, tous droits réservés</p>
        </div>
      </footer>
    </div>
  );
};

export default EFriLanding;
