import { useParams } from 'react-router-dom';
import { GENERATIONS } from '@/lib/pokeapi';
import { PokemonGrid } from '@/components/PokemonGrid';
import { CatalogPageShell } from '@/components/catalog/CatalogPageShell';
import { localized } from '@/lib/language';
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
        title={localized('Região não encontrada', 'Region not found')}
        subtitle={localized(
          'Escolha uma região na página inicial.',
          'Choose a region from the home page.',
        )}
      >
        <p className="catalog-empty">{localized('Região não encontrada.', 'Region not found.')}</p>
      </CatalogPageShell>
    );
  return (
    <CatalogPageShell
      title={
        generation.region === 'Desconhecida'
          ? localized('Desconhecida', 'Unknown')
          : generation.region
      }
      subtitle={`${generation.region === 'Desconhecida' ? localized('Pokémon sem região definida', 'Pokémon with no region assigned') : `${localized('Região de', 'Region:')} ${generation.region}`} · #${generation.pokemonRange[0]}–#${generation.pokemonRange[1]}`}
      background={REGION_BG[generation.region] ?? ''}
      backToTop
    >
      <PokemonGrid key={generation.id} generation={generation} />
    </CatalogPageShell>
  );
}
