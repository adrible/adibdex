import { getDefensiveMatchups, getOffensiveMatchups } from '@/lib/type-effectiveness';
import { TypeBadge } from '@/components/TypeBadge';
import { Shield, Swords, Ban } from 'lucide-react';

interface Props {
  types: string[];
}

export function TypeEffectiveness({ types }: Props) {
  const defense = getDefensiveMatchups(types);
  const offense = getOffensiveMatchups(types);

  return (
    <div className="rounded-xl bg-card border border-border p-6 space-y-6">
      <h3 className="section-title">Efetividade de Tipo</h3>

      {/* Defensive */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-destructive" />
            <span className="text-detail-label text-sm text-foreground">Fraquezas</span>
          </div>
          {defense.weaknesses.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {defense.weaknesses.map((w) => (
                <div key={w.type} className="flex items-center gap-1">
                  <TypeBadge type={w.type} size="sm" />
                  {w.multiplier > 2 && (
                    <span className="text-[10px] font-bold text-destructive">×{w.multiplier}</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Nenhuma</p>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-detail-label text-sm text-foreground">Resistências</span>
          </div>
          {defense.resistances.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {defense.resistances.map((r) => (
                <div key={r.type} className="flex items-center gap-1">
                  <TypeBadge type={r.type} size="sm" />
                  {r.multiplier < 0.5 && (
                    <span className="text-[10px] font-bold text-primary">×{r.multiplier}</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Nenhuma</p>
          )}
        </div>

        {defense.immunities.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Ban className="h-4 w-4 text-muted-foreground" />
              <span className="text-detail-label text-sm text-foreground">Imunidades</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {defense.immunities.map((t) => (
                <TypeBadge key={t} type={t} size="sm" />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Offensive */}
      <div className="border-t border-border pt-4 space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Swords className="h-4 w-4 text-primary" />
            <span className="text-detail-label text-sm text-foreground">Super Efetivo contra</span>
          </div>
          {offense.superEffective.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {offense.superEffective.map((t) => (
                <TypeBadge key={t} type={t} size="sm" />
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Nenhum</p>
          )}
        </div>

        {offense.noEffect.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Ban className="h-4 w-4 text-muted-foreground" />
              <span className="text-detail-label text-sm text-foreground">Sem efeito contra</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {offense.noEffect.map((t) => (
                <TypeBadge key={t} type={t} size="sm" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
