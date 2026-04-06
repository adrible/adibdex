import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { CompareProvider } from "@/contexts/CompareContext";
import { ComparePanel } from "@/components/ComparePanel";
import { Skeleton } from "@/components/ui/skeleton";

const Index = lazy(() => import("./pages/Index"));
const GenerationPage = lazy(() => import("./pages/GenerationPage"));
const NationalDexPage = lazy(() => import("./pages/NationalDexPage"));
const PokemonDetailPage = lazy(() => import("./pages/PokemonDetailPage"));
const ComparePage = lazy(() => import("./pages/ComparePage"));
const SpecialFormsPage = lazy(() => import("./pages/SpecialFormsPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 30,
      gcTime: 1000 * 60 * 60,
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="space-y-4 w-64">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4 mx-auto" />
      </div>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <CompareProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/national" element={<NationalDexPage />} />
                <Route path="/generation/:id" element={<GenerationPage />} />
                <Route path="/pokemon/:id" element={<PokemonDetailPage />} />
                <Route path="/compare" element={<ComparePage />} />
                <Route path="/mega" element={<SpecialFormsPage type="mega" />} />
                <Route path="/gmax" element={<SpecialFormsPage type="gmax" />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <ComparePanel />
          </CompareProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
