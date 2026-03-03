import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import UniLibLogo from "../UniLibLogo";
import logoIfri from "@/assets/logoifri.png";
import logoEpac from "@/assets/epac.png";
import logoEneam from "@/assets/eneam.png";
import logoImsp from "@/assets/imsp.png";
import { useToast } from "@/hooks/use-toast";

interface SchoolNode {
  id: string;
  name: string;
  logo: string;
  x: number;
  y: number;
  available: boolean;
  route?: string;
}

const schools: SchoolNode[] = [
  { id: "ifri", name: "IFRI", logo: logoIfri, x: 15, y: 30, available: true, route: "/e-fri" },
  { id: "epac", name: "EPAC", logo: logoEpac, x: 75, y: 20, available: false },
  { id: "eneam", name: "ENEAM", logo: logoEneam, x: 20, y: 75, available: false },
  { id: "imsp", name: "IMSP", logo: logoImsp, x: 80, y: 65, available: false },
];

const CENTER_X = 50;
const CENTER_Y = 50;

const NetworkSection = () => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Stable Z-positions for 3D effect without jitter
  const zPositions = useMemo(() => {
    return schools.reduce((acc, school) => {
      acc[school.id] = Math.random() * 40 - 20; // Reduced range to avoid too much depth interference
      return acc;
    }, {} as Record<string, number>);
  }, []);

  // const handleNodeClick = (school: SchoolNode) => {
  //   if (school.available && school.route) {
  //     navigate(school.route);
  //   } else {
  //     toast({
  //       title: "Bientôt disponible",
  //       description: `L'espace ${school.name} sera bientôt disponible sur UniLib.`,
  //     });
  //   }
  // };

  const handleNodeClick = (link) => {
    navigate(link);
  };

  const strokeColor = "#cdcdcd"
  const strokeColorActive = "#529dff"

  return (
    <section id="ecoles" className="bg-network py-16 lg:py-24 overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12 text-center mb-12">
        <h2 className="font-poppins font-bold text-3xl text-foreground mb-4">Notre Réseau d'Excellence</h2>
        <p className="font-inter text-muted-foreground max-w-2xl mx-auto text-sm">
          Connectez-vous à votre établissement pour accéder à vos ressources spécifiques
        </p>
      </div>

      {/* <div className="container mx-auto px-6 lg:px-12 network-container-3d">
        <div className="relative w-full max-w-3xl mx-auto circuit-wrapper-3d" style={{ aspectRatio: "4/3" }}>
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            {schools.map((school) => (
              <line
                key={school.id}
                x1={CENTER_X}
                y1={CENTER_Y}
                x2={school.x}
                y2={school.y}
                stroke="hsl(var(--secondary))"
                strokeWidth="0.4"
                className={`pulse-connection transition-all duration-500 ${hoveredNode === school.id ? "pulse-connection-active" : "branch-breathing"
                  }`}
              />
            ))}
          </svg>

          <div
            className="absolute flex items-center justify-center z-30"
            style={{
              left: `${CENTER_X}%`,
              top: `${CENTER_Y}%`,
              transform: "translate(-50%, -50%) translateZ(30px)",
            }}
          >
            <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-full bg-background border-4 border-secondary/20 shadow-xl flex items-center justify-center">
              <div className="animate-pulse">
                <UniLibLogo size="default" />
              </div>
            </div>
          </div>

          {schools.map((school) => (
            <div
              key={school.id}
              className="absolute cursor-pointer"
              style={{
                left: `${school.x}%`,
                top: `${school.y}%`,
                width: "80px",
                height: "80px",
                transform: "translate(-50%, -50%)",
                zIndex: hoveredNode === school.id ? 100 : 20,
              }}
              onMouseEnter={() => setHoveredNode(school.id)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => handleNodeClick(school)}
            >
              <div
                className="w-full h-full flex items-center justify-center transition-all duration-300"
                style={{
                  transform: `translateZ(${zPositions[school.id]}px) ${hoveredNode === school.id ? "scale(1.1)" : "scale(1)"
                    }`,
                }}
              >
                <div
                  className={`w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-background flex items-center justify-center transition-all overflow-hidden shadow-lg border-2 ${school.available
                      ? "border-secondary shadow-secondary/10"
                      : "border-muted-foreground/10 grayscale opacity-60"
                    } ${hoveredNode === school.id ? "border-secondary ring-4 ring-secondary/20" : ""}`}
                >
                  <img
                    src={school.logo}
                    alt={school.name}
                    className="w-12 h-12 lg:w-14 lg:h-14 object-contain"
                  />
                </div>
              </div>

              {hoveredNode === school.id && (
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-foreground text-background px-4 py-2 rounded-lg font-inter text-[10px] font-semibold whitespace-nowrap z-50 shadow-2xl animate-in fade-in slide-in-from-bottom-2">
                  {school.available ? `Accéder à l'espace ${school.name}` : `${school.name} — Bientôt disponible`}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent border-t-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div> */}

      <div className="w-[80vw] lg:w-[60vw] mx-auto max-w-[900px] grid grid-cols-10 grid-rows-10">


        {/* horizontal lines */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 3" className="row-start-4 row-end-6 col-start-1 col-end-5">
          <path d="M 0 0 L 4 0 C 5 0 5 1 5 1 L 5 2 C 5 3 6 3 6 3 L 10 3" stroke={hoveredNode === "ifri" ? strokeColorActive : strokeColor} stroke-width="0.05" fill="none" />
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 3" className="row-start-6 row-end-8 col-start-1 col-end-5">
          <path d="M 0 3 L 6 3 C 7 3 7 2 7 2 L 7 1 C 7 0 8 0 8 0 L 10 0" stroke={hoveredNode === "eneam" ? strokeColorActive : strokeColor} stroke-width="0.05" fill="none" />
        </svg>

        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 3" className="row-start-4 row-end-6 col-start-7 col-end-11">
          <path d="M 10 0 L 4 0 C 3 0 3 1 3 1 L 3 2 C 3 3 2 3 2 3 L 0 3" stroke={hoveredNode === "epac" ? strokeColorActive : strokeColor} stroke-width="0.05" fill="none" />
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 3" className="row-start-6 row-end-8 col-start-7 col-end-11">
          <path d="M 0 0 L 4 0 C 5 0 5 1 5 1 L 5 2 C 5 3 6 3 6 3 L 10 3" stroke={hoveredNode === "fsa" ? strokeColorActive : strokeColor} stroke-width="0.05" fill="none" />
        </svg>

        {/* vertical lines */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1.5 3" className="row-start-2 row-end-5 col-start-5 col-end-6">
          <path d="M 1.5 3 L 1.5 1.5 C 1.5 1 1 1 1 1 L 0.5 1 C 0 1 0 0.6 0 0.6 L 0 0" stroke={hoveredNode === "ine" ? strokeColorActive : strokeColor} stroke-width="0.05" fill="none" />
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1.5 3" className="row-start-7 row-end-10 col-start-6 col-end-7">
          <path d="M 1.5 3 L 1.5 1.5 C 1.5 1 1 1 1 1 L 0.5 1 C 0 1 0 0.6 0 0.6 L 0 0" stroke={hoveredNode === "imsp" ? strokeColorActive : strokeColor} stroke-width="0.05" fill="none" />
        </svg>

        {/* entity element */}
        {/* unilib */}
        <div
          className="col-start-5 col-end-7 row-start-5 row-end-7 relative flex flex-col items-center justify-center before:content-[''] before:border-2 before:border-orange-200 before:bg-[url(/favicon2.svg)] before:bg-center before:bg-[length:60%] before:bg-no-repeat before:hover:scale-[1.05] before:transition-all duration-700 before:w-full before:aspect-square before:rounded-full before:bg-white before:shadow-md before:block before:absolute"></div>
        {/* imsp */}
        <div
          style={{
            zIndex: hoveredNode === "imsp" ? 100 : 20,
          }}
          onMouseEnter={() => setHoveredNode("imsp")}
          onMouseLeave={() => setHoveredNode(null)}
          onClick={() => handleNodeClick("/coming-soon")}
          className="col-start-6 col-end-8 row-start-10 row-end-11 relative flex flex-col items-center justify-center before:content-[''] before:hover:border-4 before:hover:animate-stop before:animate-ping-bounce before:border-2 before:border-blue-300 before:animate-delay-500 before:grayscale-[100%] before:bg-[url(/src/assets/imsp.png)] before:bg-center before:bg-[length:60%] before:bg-no-repeat before:hover:scale-[1.05] before:hover:grayscale-0 before:transition-all duration-700 before:w-[10vw] before:min-w-[50px] before:max-w-[120px] before:aspect-square before:rounded-full before:bg-white before:shadow-md before:block before:absolute"></div>
        {/* ifri */}
        <div
          style={{
            zIndex: hoveredNode === "ifri" ? 100 : 20,
          }}
          onMouseEnter={() => setHoveredNode("ifri")}
          onMouseLeave={() => setHoveredNode(null)}
          onClick={() => handleNodeClick("/e-fri")}
          className="col-start-1 col-end-2 row-start-3 row-end-5 relative flex flex-col items-center justify-center before:content-[''] before:hover:border-4 before:hover:animate-stop before:animate-ping-bounce before:border-2 before:border-blue-300 before:animate-delay-200 before:bg-[url(/src/assets/logoifri.png)] before:bg-center before:bg-[length:60%] before:bg-no-repeat before:hover:scale-[1.05] before:hover:grayscale-0 before:transition-all duration-700 before:w-[10vw] before:min-w-[50px] before:max-w-[120px] before:aspect-square before:rounded-full before:bg-white before:shadow-md before:block before:absolute"></div>

        {hoveredNode === "ifri" && (
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-foreground text-background px-4 py-2 rounded-lg font-inter text-[10px] font-semibold whitespace-nowrap z-50 shadow-2xl animate-in fade-in slide-in-from-bottom-2">
            {`Accéder à l'espace e-FRI`}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent border-t-foreground" />
          </div>
        )}
        {/* eneam */}
        <div
          style={{
            zIndex: hoveredNode === "eneam" ? 100 : 20,
          }}
          onMouseEnter={() => setHoveredNode("eneam")}
          onMouseLeave={() => setHoveredNode(null)}
          onClick={() => handleNodeClick("/coming-soon")}
          className="col-start-1 col-end-2 row-start-7 row-end-9 relative flex flex-col items-center justify-center before:content-[''] before:hover:border-4 before:hover:animate-stop before:animate-ping-bounce before:border-2 before:border-blue-300 before:animate-delay-700 before:grayscale-[100%] before:bg-[url(/src/assets/eneam.png)] before:bg-center before:bg-[length:60%] before:bg-no-repeat before:hover:scale-[1.05] before:hover:grayscale-0 before:transition-all duration-700 before:w-[10vw] before:min-w-[50px] before:max-w-[120px] before:aspect-square before:rounded-full before:bg-white before:shadow-md before:block before:absolute"></div>
        {/* epac */}
        <div
          style={{
            zIndex: hoveredNode === "epac" ? 100 : 20,
          }}
          onMouseEnter={() => setHoveredNode("epac")}
          onMouseLeave={() => setHoveredNode(null)}
          onClick={() => handleNodeClick("/coming-soon")}
          className="col-start-10 col-end-11 row-start-3 row-end-5 relative flex flex-col items-center justify-center before:content-[''] before:hover:border-4 before:hover:animate-stop before:animate-ping-bounce before:border-2 before:border-blue-300 before:animate-delay-200 before:grayscale-[100%] before:bg-[url(/src/assets/epac.png)] before:bg-center before:bg-[length:60%] before:bg-no-repeat before:hover:scale-[1.05] before:hover:grayscale-0 before:transition-all duration-700 before:w-[10vw] before:min-w-[50px] before:max-w-[120px] before:aspect-square before:rounded-full before:bg-white before:shadow-md before:block before:absolute"></div>
        {/* fsa */}
        <div
          style={{
            zIndex: hoveredNode === "fsa" ? 100 : 20,
          }}
          onMouseEnter={() => setHoveredNode("fsa")}
          onMouseLeave={() => setHoveredNode(null)}
          onClick={() => handleNodeClick("/coming-soon")}
          className="col-start-10 col-end-11 row-start-7 row-end-9 relative flex flex-col items-center justify-center before:content-[''] before:hover:border-4 before:hover:animate-stop before:animate-ping-bounce before:border-2 before:border-blue-300 before:animate-delay-500 before:grayscale-[100%] before:bg-[url(/src/assets/logo_placeholder.png)] before:bg-center before:bg-[length:60%] before:bg-no-repeat before:hover:scale-[1.05] before:hover:grayscale-0 before:transition-all duration-700 before:w-[10vw] before:min-w-[50px] before:max-w-[120px] before:aspect-square before:rounded-full before:bg-white before:shadow-md before:block before:absolute"></div>
        {/* ine */}
        <div
          style={{
            zIndex: hoveredNode === "ine" ? 100 : 20,
          }}
          onMouseEnter={() => setHoveredNode("ine")}
          onMouseLeave={() => setHoveredNode(null)}
          onClick={() => handleNodeClick("/coming-soon")}
          className="col-start-4 col-end-6 row-start-1 row-end-2 relative flex flex-col items-center justify-center before:content-[''] before:hover:border-4 before:hover:animate-stop before:animate-ping-bounce before:border-2 before:border-blue-300 before:animate-delay-400 before:grayscale-[100%] before:bg-[url(/src/assets/logo_placeholder.png)] before:bg-center before:bg-[length:60%] before:bg-no-repeat before:hover:scale-[1.05] before:hover:grayscale-0 before:transition-all duration-700 before:w-[10vw] before:min-w-[50px] before:max-w-[120px] before:aspect-square before:rounded-full before:bg-white before:shadow-md before:block before:absolute"></div>


      </div>
    </section>
  );
};

export default NetworkSection;
