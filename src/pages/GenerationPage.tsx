import { useParams } from 'react-router-dom';
import { GENERATIONS } from '@/lib/pokeapi';
import { PokemonGrid } from '@/components/PokemonGrid';
import { CatalogPageShell } from '@/components/catalog/CatalogPageShell';
const REGION_BG: Record<string, string> = {
  Kanto: '/backgrounds/kanto.webp',
  Johto: '/backgrounds/johto.webp',
  Hoenn: '/backgrounds/hoenn.webp',
  Sinnoh: '/backgrounds/sinnoh.webp',
  Unova: '/backgrounds/unova.webp',
  Kalos: '/backgrounds/kalos.webp',
  Alola: '/backgrounds/alola.webp',
  Galar: '/backgrounds/galar.webp',
  Hisui: '/backgrounds/hisui.webp',
  Paldea: '/backgrounds/paldea.webp',
  Desconhecida: '',
};

export default function GenerationPage() {
  const { id } = useParams();
  const generation = GENERATIONS.find((g) => g.id === Number(id));
  if (!generation)
    return (
      <CatalogPageShell
        title="Região não encontrada"
        subtitle="Escolha uma região na página inicial."
      >
        <p className="catalog-empty">Região não encontrada.</p>
      </CatalogPageShell>
    );
  return (
    <CatalogPageShell
      title={generation.region}
      subtitle={`${generation.region === 'Desconhecida' ? 'Pokémon sem região definida' : `Região de ${generation.region}`} · #${generation.pokemonRange[0]}–#${generation.pokemonRange[1]}`}
      background={REGION_BG[generation.region] ?? ''}
      backToTop
    >
      <PokemonGrid key={generation.id} generation={generation} />
    </CatalogPageShell>
  );
}
