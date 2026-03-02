import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import EFriLanding from "./pages/EFriLanding";
import EFriLogin from "./pages/EFriLogin";
import EFriSignup from "./pages/EFriSignup";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import EFriDashboard from "./pages/EFriDashboard";
import EFriResources from "./pages/EFriResources";
import EFriProjects from "./pages/EFriProjects";
import EFriSchedule from "./pages/EFriSchedule";
import EFriAI from "./pages/EFriAI";
import EFriContribute from "./pages/EFriContribute";
import EFriProfile from "./pages/EFriProfile";
import EFriAdmin from "./pages/EFriAdmin";
import EFriForgotPassword from "./pages/EFriForgotPassword";
import NotFound from "./pages/NotFound";
import EFriGlobalSearch from "./pages/EFriGlobalSearch";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/e-fri" element={<EFriLanding />} />
            <Route path="/e-fri/connexion" element={<EFriLogin />} />
            <Route path="/e-fri/inscription" element={<EFriSignup />} />
            <Route path="/e-fri/mot-de-passe-oublie" element={<EFriForgotPassword />} />
            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="/e-fri/dashboard" element={<EFriDashboard />} />
              <Route path="/e-fri/ressources" element={<EFriResources />} />
              <Route path="/e-fri/cours-pratiques" element={<EFriProjects />} />
              <Route path="/e-fri/emploi-du-temps" element={<EFriSchedule />} />
              <Route path="/e-fri/ia" element={<EFriAI />} />
              <Route path="/e-fri/televerser" element={<EFriContribute />} />
              <Route path="/e-fri/profil" element={<EFriProfile />} />
              <Route path="/e-fri/admin" element={<EFriAdmin />} />
              <Route path="/e-fri/search" element={<EFriGlobalSearch />} /> 
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
    
  );

};

export default App;
