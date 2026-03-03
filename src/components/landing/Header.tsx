import { Link } from "react-router-dom";
import UniLibLogo from "../UniLibLogo";
import logoUac from "@/assets/logouac.png";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-neutral-200">
      <div className="container mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
        <Link to="/">
          <div className="flex items-center gap-4">
            <UniLibLogo />
            <div className="h-8 w-px bg-border hidden sm:block" />
            <img src={logoUac} alt="UAC" className="h-10 object-contain hidden sm:block" />
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <a href="/#accueil" className="font-inter text-sm font-medium text-foreground">
            Accueil
          </a>
          <a href="/#fonctionnalites" className="font-inter text-sm text-muted-foreground hover:text-foreground transition-colors">
            Fonctionnalités
          </a>
          <a href="/#ecoles" className="font-inter text-sm text-muted-foreground hover:text-foreground transition-colors">
            Ecoles connectées
          </a>
        </nav>

      </div>
    </header>
  );
};

export default Header;
