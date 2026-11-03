import { useQuery } from '@tanstack/react-query';
import { ChevronDown } from 'lucide-react';
import { fetchPokemonSpeciesInfo } from '@/lib/pokeapi';
import { Skeleton } from '@/components/ui/skeleton';

const EGG_GROUPS: Record<string, string> = {
  amorphous: 'Amorfo',
  bug: 'Inseto',
  dragon: 'Dragão',
  fairy: 'Fada',
  field: 'Campo',
  flying: 'Voador',
  grass: 'Planta',
  'human-like': 'Humanoide',
  mineral: 'Mineral',
  monster: 'Monstro',
  'no-eggs': 'Não pode gerar ovos',
  water1: 'Água 1',
  water2: 'Água 2',
  water3: 'Água 3',
  ditto: 'Ditto',
};

const GROWTH_RATES: Record<string, string> = {
  slow: 'Lento',
  medium: 'Médio',
  fast: 'Rápido',
  'medium-slow': 'Médio-lento',
  'slow-then-very-fast': 'Lento e depois muito rápido',
  'fast-then-very-slow': 'Rápido e depois muito lento',
};

const HABITATS: Record<string, string> = {
  cave: 'Caverna',
  forest: 'Floresta',
  grassland: 'Campos',
  mountain: 'Montanha',
  rare: 'Raro',
  'rough-terrain': 'Terreno acidentado',
  sea: 'Mar',
  urban: 'Urbano',
  'waters-edge': 'Margem de água',
};

function humanize(value: string) {
  return value.replace(/-/g, ' ').replace(/^\w/, (letter) => letter.toUpperCase());
}

function percent(value: number) {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(value);
}

export function PokemonSpeciesProfile({ speciesId }: { speciesId: number }) {
  const { data, isPending } = useQuery({
    queryKey: ['pokemon-species-info', speciesId],
    queryFn: ({ signal }) => fetchPokemonSpeciesInfo(speciesId, signal),
    staleTime: 24 * 60 * 60_000,
  });

  if (!data && isPending) {
    return (
      <div className="species-profile" aria-label="Carregando dados da espécie">
        <Skeleton className="mb-2 h-3 w-28" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
    );
  }
  if (!data) return null;

  const femaleRate = data.genderRate === null || data.genderRate < 0 ? null : data.genderRate * 12.5;
  const statusTags = [
    data.isMythical ? 'Mítico' : null,
    data.isLegendary ? 'Lendário' : null,
    data.isBaby ? 'Bebê' : null,
  ].filter((tag): tag is string => Boolean(tag));

  return (
    <div className="species-profile">
      {(data.genus || statusTags.length > 0) && (
        <div className="species-profile-heading">
          {data.genus && <span className="species-profile-genus">{data.genus}</span>}
          {statusTags.map((tag) => (
            <span key={tag} className="species-profile-tag">
              {tag}
            </span>
          ))}
        </div>
      )}
      {data.description && <p className="species-profile-description">{data.description}</p>}
      <details className="species-profile-details">
        <summary>
          Dados de captura e reprodução
          <ChevronDown aria-hidden="true" />
        </summary>
        <div className="species-profile-facts">
          {data.captureRate !== null && (
            <div>
              <span>Taxa de captura</span>
              <strong>{data.captureRate}/255</strong>
            </div>
          )}
          {data.genderRate !== null && (
            <div>
              <span>Gênero</span>
              <strong>
                {femaleRate === null
                  ? 'Sem gênero'
                  : `Fêmea ${percent(femaleRate)}% · Macho ${percent(100 - femaleRate)}%`}
              </strong>
            </div>
          )}
          {data.eggGroups.length > 0 && (
            <div>
              <span>Grupo de ovos</span>
              <strong>{data.eggGroups.map((group) => EGG_GROUPS[group] ?? humanize(group)).join(' · ')}</strong>
            </div>
          )}
          {data.hatchCounter !== null && (
            <div>
              <span>Ciclos para eclodir</span>
              <strong>{data.hatchCounter + 1}</strong>
            </div>
          )}
          {data.growthRate && (
            <div>
              <span>Crescimento</span>
              <strong>{GROWTH_RATES[data.growthRate] ?? humanize(data.growthRate)}</strong>
            </div>
          )}
          {data.habitat && (
            <div>
              <span>Habitat</span>
              <strong>{HABITATS[data.habitat] ?? humanize(data.habitat)}</strong>
            </div>
          )}
        </div>
      </details>
    </div>
  );
}
