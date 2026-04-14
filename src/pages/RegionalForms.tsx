import { Header } from '@/components/Header';

export default function RegionalForms() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-12">
        <h1 className="text-2xl font-bold text-center mb-6">
          Formas Regionais
        </h1>

        <p className="text-center text-muted-foreground">
          Aqui vão aparecer todas as formas regionais em ordem da Pokédex.
        </p>
      </main>
    </div>
  );
}
