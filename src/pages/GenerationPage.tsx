import { useParams } from 'react-router-dom';
import { GENERATIONS } from '@/lib/pokeapi';
import { PokemonGrid } from '@/components/PokemonGrid';
import { CatalogPageShell } from '@/components/catalog/CatalogPageShell';
import { localized } from '@/lib/language';
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
      title={generation.id === 10 ? localized('Desconhecida', 'Unknown') : generation.region}
      subtitle={`${generation.id === 10 ? localized('Pokémon sem região definida', 'Pokémon with no region assigned') : `${localized('Região de', 'Region:')} ${generation.region}`} · #${generation.pokemonRange[0]}–#${generation.pokemonRange[1]}`}
      backToTop
    >
      <PokemonGrid key={generation.id} generation={generation} />
    </CatalogPageShell>
  );
}
