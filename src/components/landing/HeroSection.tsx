import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import studentHero from "@/assets/retouch_2026021720400735.png";

const DotGrid = ({ color }: { color: string }) => (
  <div className="grid grid-cols-4 gap-[6px]">
    {Array.from({ length: 16 }).map((_, i) => (
      <div key={i} className="w-[5px] h-[5px] rounded-full" style={{ backgroundColor: color }} />
    ))}
  </div>
);

const HeroSection = () => {
  return (
    <section id="accueil" className="relative overflow-hidden bg-background pt-28 pb-16 lg:pt-36 lg:pb-24">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          

          {/* Left column - Text */}
          <div className="flex-1 lg:max-w-[55%] relative z-10 pt-12">
            <h1 className="font-semibold text-4xl lg:text-5xl text-foreground leading-loose mb-4">
              Préparez vos examens avec les bonnes ressources.
              <ArrowRight className="inline-block ml-3 text-secondary" size={32} />
            </h1>

            <p className="font-inter text-sm text-muted-foreground mb-8 max-w-md leading-relaxed">
              Accédez facilement aux épreuves, consultez les sujets des années précédentes et préparez vos examens avec des ressources fiables et organisées
            </p>

            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <Link to="/choix-entite" className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 font-inter text-sm font-medium text-accent-foreground hover:bg-accent-hover transition-colors">
                Accéder aux épreuves
                <ArrowUpRight size={16} />
              </Link>

              <Link to="/choix-entite" className="inline-flex items-center gap-2 rounded-lg border border-accent px-6 py-3 font-inter text-sm font-medium text-accent hover:bg-accent hover:text-accent-foreground transition-colors">
                Choisir mon entité
              </Link>

            </div>
          </div>

          {/* Right column - Photo + Decorative shapes */}
          <div className="flex-1 relative h-[400px] lg:h-[530px] w-full max-w-[550px] flex items-center justify-center">
            {/* 1. Blue Card (Main background) */}
            <div
              className="hidden lg:block absolute rounded-[40px] shadow-lg animate-in fade-in zoom-in duration-700 lg:w-[420px] lg:h-[420px] lg:top-[40px] lg:right-[80px]"
              style={{
                backgroundColor: "hsl(var(--secondary))",
                width: "280px",
                height: "280px",
                top: "40px",
                right: "60px",
                transform: "rotate(45deg)",
                zIndex: 1,
              }}
            />

            {/* 2. Orange Circle */}
            <div
              className="hidden lg:block absolute rounded-full shadow-md animate-hero-float-orange"
              style={{
                backgroundColor: "rgba(255, 152, 0, 0.25)",
                border: "2px solid hsl(var(--accent))",
                width: "40px",
                height: "80px",
                bottom: "10px",
                left: "30px",
                zIndex: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <div className="w-5 h-5 rounded-full border border-[hsl(var(--accent))] flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-[hsl(var(--accent))] mr-1" />
                <div className="w-1 h-1 rounded-full bg-[hsl(var(--accent))]" />
              </div>
            </div>

            {/* 3. Green Circle (Top left overlay) - Floating */}
            <div
              className="hidden lg:block absolute rounded-full shadow-sm animate-hero-float-green w-[40px] h-[40px] lg:w-[70px] lg:h-[70px]"
              style={{
                backgroundColor: "rgba(1, 171, 7, 0.78)", // Green
                top: "120px",
                left: "50px",
                zIndex: 1,

              }}
            />

            {/* 4. Small Blue Circle (Accent right) - Floating */}
            <div
              className="hidden lg:block absolute rounded-full shadow-sm animate-hero-float-blue w-[20px] h-[20px] lg:w-[35px] lg:h-[35px]"
              style={{
                backgroundColor: "hsl(var(--secondary))",
                bottom: "150px",
                right: "0px",
                zIndex: 0,
              }}
            />


            {/* 6. Main Student Image */}
            <div className="hidden lg:block absolute inset-x-0 bottom-10 lg:bottom-20 flex justify-center items-end z-[3]">
              <div className="relative w-[180px] h-[240px] lg:w-[220px] lg:h-[400px] left-[250px] bottom-[30px] overflow-visible animate-in fade-in slide-in-from-bottom duration-1000">

                <img
                  src={studentHero}
                  alt="Étudiant IFRI"
                  className="w-full h-full object-contain"
                  style={{
                    objectPosition: "center top",

                    filter: "drop-shadow(0 0px 0px rgba(0,0,0,0.15))",
                    maskImage: "linear-gradient(to bottom, black 89%, transparent 85%)",
                    WebkitMaskImage: "linear-gradient(to bottom, white 80%, transparent 89%)",
                  }}
                />
              </div>
            </div>

            {/* 7. Floating "Smiley" bubbles - Orange and Blue */}
            <div className="hidden lg:block absolute top-[60px] right-[20px] z-10 bg-white/90 p-2 rounded-full shadow-lg border border-gray-100 animate-hero-float-blue">
              <div className="w-5 h-5 rounded-full border-2 border-[hsl(var(--secondary))] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--secondary))] mr-0.5" />
                <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--secondary))]" />
              </div>
            </div>

            <div className="hidden lg:block absolute bottom-[200px] left-[20%] z-10 bg-white/90 p-2 rounded-full shadow-lg border border-gray-100 animate-hero-float-orange">
              <div className="w-5 h-5 rounded-full border-2 border-[hsl(var(--accent))] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--accent))] mr-0.5" />
                <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--accent))]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;