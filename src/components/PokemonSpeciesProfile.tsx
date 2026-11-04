import { SourceText } from '@/components/SourceText';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown } from 'lucide-react';
import { fetchPokemonSpeciesInfo } from '@/lib/pokeapi';
import { Skeleton } from '@/components/ui/skeleton';
import { localized, siteLocale } from '@/lib/language';

const EGG_GROUPS: Record<string, string> = {
  amorphous: localized('Amorfo', 'Amorphous'),
  bug: localized('Inseto', 'Bug'),
  dragon: localized('Dragão', 'Dragon'),
  fairy: localized('Fada', 'Fairy'),
  field: localized('Campo', 'Field'),
  flying: localized('Voador', 'Flying'),
  grass: localized('Planta', 'Grass'),
  'human-like': localized('Humanoide', 'Human-Like'),
  mineral: localized('Mineral', 'Mineral'),
  monster: localized('Monstro', 'Monster'),
  'no-eggs': localized('Não pode gerar ovos', 'No eggs'),
  water1: localized('Água 1', 'Water 1'),
  water2: localized('Água 2', 'Water 2'),
  water3: localized('Água 3', 'Water 3'),
  ditto: 'Ditto',
};

const GROWTH_RATES: Record<string, string> = {
  slow: localized('Lento', 'Slow'),
  medium: localized('Médio', 'Medium'),
  fast: localized('Rápido', 'Fast'),
  'medium-slow': localized('Médio-lento', 'Medium-slow'),
  'slow-then-very-fast': localized('Lento e depois muito rápido', 'Slow, then very fast'),
  'fast-then-very-slow': localized('Rápido e depois muito lento', 'Fast, then very slow'),
};

const HABITATS: Record<string, string> = {
  cave: localized('Caverna', 'Cave'),
  forest: localized('Floresta', 'Forest'),
  grassland: localized('Campos', 'Grassland'),
  mountain: localized('Montanha', 'Mountain'),
  rare: localized('Raro', 'Rare'),
  'rough-terrain': localized('Terreno acidentado', 'Rough terrain'),
  sea: localized('Mar', 'Sea'),
  urban: localized('Urbano', 'Urban'),
  'waters-edge': localized('Margem de água', 'Waters-edge'),
};

function humanize(value: string) {
  return value.replace(/-/g, ' ').replace(/^\w/, (letter) => letter.toUpperCase());
}

function percent(value: number) {
  return new Intl.NumberFormat(siteLocale(), { maximumFractionDigits: 1 }).format(value);
}

export function PokemonSpeciesProfile({ speciesId }: { speciesId: number }) {
  const { data, isPending } = useQuery({
    queryKey: ['pokemon-species-info', speciesId],
    queryFn: ({ signal }) => fetchPokemonSpeciesInfo(speciesId, signal),
    staleTime: 24 * 60 * 60_000,
  });

  if (!data && isPending) {
    return (
      <div
        className="species-profile"
        aria-label={localized('Carregando dados da espécie', 'Loading species data')}
      >
        <Skeleton className="mb-2 h-3 w-28" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
    );
  }
  if (!data) return null;

  const femaleRate =
    data.genderRate === null || data.genderRate < 0 ? null : data.genderRate * 12.5;
  const statusTags = [
    data.isMythical ? localized('Mítico', 'Mythical') : null,
    data.isLegendary ? localized('Lendário', 'Legendary') : null,
    data.isBaby ? localized('Bebê', 'Baby') : null,
  ].filter((tag): tag is string => Boolean(tag));

  return (
    <div className="species-profile">
      {(data.genus || statusTags.length > 0) && (
        <div className="species-profile-heading">
          {data.genus && (
            <span className="species-profile-genus">
              <SourceText text={data.genus} language={data.genusLanguage} />
            </span>
          )}
          {statusTags.map((tag) => (
            <span key={tag} className="species-profile-tag">
              {tag}
            </span>
          ))}
        </div>
      )}
      {data.description && (
        <p className="species-profile-description">
          <SourceText text={data.description} language={data.descriptionLanguage} />
        </p>
      )}
      <details className="species-profile-details">
        <summary>
          {localized('Dados de captura e reprodução', 'Capture and breeding data')}
          <ChevronDown aria-hidden="true" />
        </summary>
        <div className="species-profile-facts">
          {data.captureRate !== null && (
            <div>
              <span>{localized('Taxa de captura', 'Catch rate')}</span>
              <strong>{data.captureRate}/255</strong>
            </div>
          )}
          {data.genderRate !== null && (
            <div>
              <span>{localized('Gênero', 'Gender')}</span>
              <strong>
                {femaleRate === null
                  ? localized('Sem gênero', 'Genderless')
                  : `${localized('Fêmea', 'Female')} ${percent(femaleRate)}% · ${localized('Macho', 'Male')} ${percent(100 - femaleRate)}%`}
              </strong>
            </div>
          )}
          {data.eggGroups.length > 0 && (
            <div>
              <span>{localized('Grupo de ovos', 'Egg groups')}</span>
              <strong>
                {data.eggGroups.map((group) => EGG_GROUPS[group] ?? humanize(group)).join(' · ')}
              </strong>
            </div>
          )}
          {data.hatchCounter !== null && (
            <div>
              <span>{localized('Ciclos para eclodir', 'Hatch cycles')}</span>
              <strong>{data.hatchCounter + 1}</strong>
            </div>
          )}
          {data.growthRate && (
            <div>
              <span>{localized('Crescimento', 'Growth rate')}</span>
              <strong>{GROWTH_RATES[data.growthRate] ?? humanize(data.growthRate)}</strong>
            </div>
          )}
          {data.habitat && (
            <div>
              <span>{localized('Habitat', 'Habitat')}</span>
              <strong>{HABITATS[data.habitat] ?? humanize(data.habitat)}</strong>
            </div>
          )}
        </div>
      </details>
    </div>
  );
}
