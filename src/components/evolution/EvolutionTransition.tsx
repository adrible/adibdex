import { ArrowDown, ArrowRight } from 'lucide-react';
import type { EvolutionCondition } from '@/lib/pokemon/types';
import { EvolutionRequirements } from './EvolutionRequirements';

interface Props {
  conditions: EvolutionCondition[];
  from?: string;
  to: string;
  horizontal?: boolean;
  showSource?: boolean;
}

/** Requirements belong to the incoming edge, never below the destination card. */
export function EvolutionTransition({
  conditions,
  from,
  to,
  horizontal = false,
  showSource = true,
}: Props) {
  const name = (value: string) => value.replace(/-/g, ' ');
  return (
    <div
      className={`evolution-transition ${horizontal ? 'evolution-transition--linear' : ''}`}
      role="group"
      aria-label={`Como evoluir ${from ? `${name(from)} para ` : 'para '}${name(to)}`}
    >
      <div className="evolution-transition-method">
        {!horizontal && from && showSource && (
          <p className="evolution-transition-source">
            De <span>{name(from)}</span>
          </p>
        )}
        {conditions.length ? (
          <EvolutionRequirements conditions={conditions} />
        ) : (
          <p className="evolution-transition-unknown">Método não informado</p>
        )}
      </div>
      <span className="evolution-transition-arrow" aria-hidden="true">
        <ArrowDown className="evolution-arrow-down" />
        {horizontal && <ArrowRight className="evolution-arrow-right" />}
      </span>
    </div>
  );
}
