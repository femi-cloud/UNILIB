import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import studentHero from "@/assets/retouch_2026021720400735.png";
import { Button } from "../ui/button";

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
      <div className="w-full lg:w-[85%] mx-auto p-10 lg:p-8">
        <img src="/dots_top.svg" className="absolute z-10 top-32 left-10 w-16 hidden lg:flex" />
        <img src="/dots_bottom.svg" className="absolute z-10 bottom-10 right-10 w-16 hidden lg:flex" />
        <div className="flex flex-col lg:flex-row items-center justify-between">


          {/* Left column - Text */}
          <div className="flex-1 lg:max-w-[55%] relative z-10 pt-12">
            <h1 className="font-semibold text-4xl lg:text-5xl text-foreground leading-snug mb-4">
              Préparez vos examens avec les bonnes ressources.
              <ArrowRight className="inline-block ml-3 text-secondary" size={32} />
            </h1>

            <p className="font-inter text-lg text-muted-foreground mb-8 max-w-md leading-relaxed">
              Accédez facilement aux épreuves, consultez les sujets des années précédentes et préparez vos examens avec des ressources fiables et organisées
            </p>

            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <Link to="/choix-entite" className="w-full md:w-max">
                <Button variant="primary" className="rounded-xl w-full md:w-max">
                  Accéder aux épreuves
                  <ArrowUpRight size={16} />

                </Button>
              </Link>

              <Link to="/choix-entite" className="w-full md:w-max">
                <Button variant="primarySoft" className="rounded-xl w-full md:w-max">
                  Choisir mon entité
                </Button>
              </Link>

            </div>
          </div>

          {/* Right column - Photo + Decorative shapes */}
          <div className="flex-1 hidden relative h-[400px] lg:h-[630px] w-full max-w-[650px] lg:flex items-center justify-center">
            <div className="relative w-[55vw] h-full flex flex-col items-end justify-center" >
              <div className=" absolute z-40 top-[20%] left-[45%] w-[15%] max-w-[200px] aspect-square rounded-[100%] bg-[#D5FFC9] animate-hero-float-orange"></div>
              <div className="relative w-[50%] max-w-[520px] aspect-square rounded-[20%] rotate-[35deg] overflow-x-clip">
                <div className="absolute w-full -rotate-[35deg] h-1/2 bg-white -bottom-[25%]"></div>
                <div className="absolute bottom-[-30%] left-[20%] w-[55%] max-w-[300px] aspect-square rounded-[100%] border-2 border-[#FFA3A3]"></div>
              </div>
              <div className="absolute w-[50%] max-w-[520px] aspect-square rounded-[20%] rotate-[35deg] bg-[#758AFF] border-0 overflow-clip">
                <div className="absolute bottom-[-30%] left-[20%] w-[55%] max-w-[300px] aspect-square rounded-[100%] bg-[#FFA3A3]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section >
  );
};

export default HeroSection;