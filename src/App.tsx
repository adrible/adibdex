import { lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { retryQuery } from '@/lib/pokeapi/client';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Skeleton } from '@/components/ui/skeleton';
import { PageMetadata } from '@/components/PageMetadata';
import { AppErrorBoundary } from '@/components/AppErrorBoundary';

const Index = lazy(() => import('./pages/Index'));
const GenerationPage = lazy(() => import('./pages/GenerationPage'));
const NationalDexPage = lazy(() => import('./pages/NationalDexPage'));
const PokemonDetailPage = lazy(() => import('./pages/PokemonDetailPage'));
const SpecialFormsPage = lazy(() => import('./pages/SpecialFormsPage'));
const RegionalForms = lazy(() => import('./pages/RegionalForms'));
const NotFound = lazy(() => import('./pages/NotFound'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 30,
      gcTime: 1000 * 60 * 60,
      refetchOnWindowFocus: false,
      retry: retryQuery,
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
      <BrowserRouter>
        <PageMetadata />
        <AppErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/national" element={<NationalDexPage />} />
              <Route path="/generation/:id" element={<GenerationPage />} />
              <Route path="/pokemon/:id" element={<PokemonDetailPage />} />
              <Route path="/mega" element={<SpecialFormsPage key="mega" type="mega" />} />
              <Route path="/gmax" element={<SpecialFormsPage key="gmax" type="gmax" />} />
              <Route path="/regional-forms" element={<RegionalForms />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AppErrorBoundary>
      </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
