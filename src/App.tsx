import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Onboarding from "./pages/Onboarding.tsx";
import MapScreen from "./pages/MapScreen.tsx";
import ExploreScreen from "./pages/ExploreScreen.tsx";
import PetDetail from "./pages/PetDetail.tsx";
import ReportScreen from "./pages/ReportScreen.tsx";
import StoriesScreen from "./pages/StoriesScreen.tsx";
import ProfileScreen from "./pages/ProfileScreen.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Onboarding />} />
          <Route path="/app/map" element={<MapScreen />} />
          <Route path="/app/explore" element={<ExploreScreen />} />
          <Route path="/app/report" element={<ReportScreen />} />
          <Route path="/app/stories" element={<StoriesScreen />} />
          <Route path="/app/profile" element={<ProfileScreen />} />
          <Route path="/pet/:id" element={<PetDetail />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
