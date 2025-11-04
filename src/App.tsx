/**
 * Main App Component
 * 
 * Sets up the application with providers and routing:
 * - QueryClientProvider: React Query for data fetching
 * - TooltipProvider: Tooltip UI component provider
 * - AuthProvider: Authentication context provider (wraps entire app)
 * - BrowserRouter: React Router for navigation
 * 
 * Routes:
 * - Public routes: /, /authentication/sign-in, /authentication/sign-up
 * - Protected routes: /account, /edit-profile, etc.
 */

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/use-auth";
import Index from "./pages/Index";
import NewFind from "./pages/NewFind";
import SiteMap from "./pages/SiteMap";
import SiteLists from "./pages/SiteLists";
import Analysis from "./pages/Analysis";
import Team from "./pages/Team";
import Explore from "./pages/Explore";
import Reports from "./pages/Reports";
import Account from "./pages/Account";
import EditProfile from "./pages/EditProfile";
import SignIn from "./pages/Authentication/sign-in";
import SignUp from "./pages/Authentication/sign-up";
import Articles from "./pages/Articles";
import CreateArticle from "./pages/CreateArticle";
import Artifacts from "./pages/Artifacts";
import CreateArtifact from "./pages/CreateArtifact";
import Donations from "./pages/Donations";
import NotFound from "./pages/NotFound";

// Create React Query client instance
const queryClient = new QueryClient();

const App = () => (
  // React Query provider for data fetching
  <QueryClientProvider client={queryClient}>
    {/* Tooltip provider for UI components */}
    <TooltipProvider>
      {/* Auth provider wraps entire app to provide authentication state */}
      <AuthProvider>
        {/* Toast notification components */}
        <Toaster />
        <Sonner />
        {/* React Router for navigation */}
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/new-find" element={<NewFind />} />
            <Route path="/site-map" element={<SiteMap />} />
            <Route path="/site-lists" element={<SiteLists />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/team" element={<Team />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/create-article" element={<CreateArticle />} />
            <Route path="/artifacts" element={<Artifacts />} />
            <Route path="/create-artifact" element={<CreateArtifact />} />
            <Route path="/donations" element={<Donations />} />

            {/* Authentication routes */}
            <Route path="/authentication/sign-in" element={<SignIn />} />
            <Route path="/authentication/sign-up" element={<SignUp />} />
            
            {/* Protected routes (require authentication) */}
            <Route path="/account" element={<Account />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            
            {/* Catch-all route for 404 pages */}
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
