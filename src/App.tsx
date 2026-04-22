import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Onboarding from "./pages/Onboarding.tsx";
import Auth from "./pages/Auth.tsx";
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
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Onboarding />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/app/map" element={<ProtectedRoute><MapScreen /></ProtectedRoute>} />
            <Route path="/app/explore" element={<ProtectedRoute><ExploreScreen /></ProtectedRoute>} />
            <Route path="/app/report" element={<ProtectedRoute><ReportScreen /></ProtectedRoute>} />
            <Route path="/app/stories" element={<ProtectedRoute><StoriesScreen /></ProtectedRoute>} />
            <Route path="/app/profile" element={<ProtectedRoute><ProfileScreen /></ProtectedRoute>} />
            <Route path="/pet/:id" element={<ProtectedRoute><PetDetail /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
