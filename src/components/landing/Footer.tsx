import UniLibLogo from "../UniLibLogo";
import logoUac from "@/assets/logouac.png";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border py-10">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">
          <div className="flex items-center gap-4">
            <UniLibLogo />
            <div className="h-8 w-px bg-border hidden sm:block" />
            <img src={logoUac} alt="UAC" className="h-10 object-contain" />
          </div>
          <nav className="flex flex-col gap-2">
            <a href="/#accueil" className="font-inter text-sm text-foreground font-medium hover:text-secondary transition-colors">
              Accueil
            </a>
            <a href="/#fonctionnalites" className="font-inter text-sm text-muted-foreground hover:text-secondary transition-colors">
              Fonctionnalités
            </a>
            <a href="/#ecoles" className="font-inter text-sm text-muted-foreground hover:text-secondary transition-colors">
              Ecoles connectées
            </a>
          </nav>
        </div>
        <p className="font-inter text-xs text-muted-foreground text-center">
          2026 ©Copyright, tous droits réservés
        </p>
      </div>
    </footer>
  );
};

export default Footer;
