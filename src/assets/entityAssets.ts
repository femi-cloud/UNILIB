// src/assets/entityAssets.ts
import ifriLogo from "@/assets/logoifri.png";
import ifriBuilding from "@/assets/IfriBuilding.jpeg";
import eneamLogo from "@/assets/eneam.png";
import imspLogo from "@/assets/imsp.png";
import epacLogo from "@/assets/epac.png";

export const entityAssets: Record<string, { logo: string; image?: string }> = {
  ifri:  { logo: ifriLogo,  image: ifriBuilding },
  eneam: { logo: eneamLogo },
  imsp:  { logo: imspLogo },
  epac:  { logo: epacLogo },
};