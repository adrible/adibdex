import {
  ArrowLeftRight,
  Sparkles,
  Heart,
  Moon,
  Sun,
  MapPin,
  Gem,
  Swords,
  Droplets,
  RotateCcw,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { EvolutionCondition } from '@/lib/pokemon/types';
import { TYPE_TRANSLATIONS } from '@/lib/pokemon/constants';
import { localized } from '@/lib/language';

const triggers: Record<string, string> = {
  'level-up': localized('Subir de nível', 'Level up'),
  trade: 'Troca',
  'use-item': 'Usar item',
  shed: 'Especial',
  spin: 'Girar',
  'tower-of-darkness': localized('Torre da Escuridão', 'Tower of Darkness'),
  'tower-of-waters': localized('Torre das Águas', 'Tower of Waters'),
  'three-critical-hits': localized('3 golpes críticos', '3 critical hits'),
  'take-damage': 'Receber dano',
  other: localized('Condição especial', 'Special condition'),
  'agile-style-move': localized('Golpe em estilo ágil', 'Agile-style move'),
  'strong-style-move': localized('Golpe em estilo forte', 'Strong-style move'),
  'recoil-damage': localized('Dano de recuo', 'Recoil damage'),
};
const words = (value: string) => value.replace(/-/g, ' ');

function Conditions({ value }: { value: EvolutionCondition }) {
  const tags: { text: string; Icon: LucideIcon }[] = [];
  const add = (text: string, Icon: LucideIcon = Sparkles) => tags.push({ text, Icon });
  if (value.minLevel !== null) add(localized(`Nível ${value.minLevel}`, `Level ${value.minLevel}`));
  if (value.trigger && (value.trigger !== 'level-up' || value.minLevel === null))
    add(
      triggers[value.trigger] ?? words(value.trigger),
      value.trigger === 'trade' ? ArrowLeftRight : Sparkles,
    );
  if (value.item) add(words(value.item), Gem);
  if (value.heldItem) add(`Segurando ${words(value.heldItem)}`, Gem);
  if (value.minHappiness !== null)
    add(localized(`Amizade ${value.minHappiness}+`, `Friendship ${value.minHappiness}+`), Heart);
  if (value.minAffection !== null)
    add(localized(`Afeição ${value.minAffection}+`, `Affection ${value.minAffection}+`), Heart);
  if (value.timeOfDay)
    add(
      {
        day: localized('Dia', 'Day'),
        night: localized('Noite', 'Night'),
        dusk: localized('Entardecer', 'Dusk'),
      }[value.timeOfDay] ?? words(value.timeOfDay),
      value.timeOfDay === 'night' ? Moon : Sun,
    );
  if (value.knownMove) add(`${localized('Saber', 'Know')} ${words(value.knownMove)}`, Swords);
  if (value.knownMoveType)
    add(
      `${localized('Golpe', 'Move')} ${TYPE_TRANSLATIONS[value.knownMoveType] ?? value.knownMoveType}`,
      Swords,
    );
  if (value.location) add(words(value.location), MapPin);
  if (value.needsRain) add(localized('Chuva', 'Rain'), Droplets);
  if (value.turnUpsideDown) add(localized('Console invertido', 'Console upside down'), RotateCcw);
  if (value.gender === 1 || value.gender === 2)
    add(value.gender === 1 ? localized('Fêmea', 'Female') : localized('Macho', 'Male'), Users);
  if (value.minBeauty !== null)
    add(localized(`Beleza ${value.minBeauty}+`, `Beauty ${value.minBeauty}+`));
  if (value.relativePhysicalStats !== null)
    add(
      {
        '-1': localized('Ataque < Defesa', 'Attack < Defense'),
        '0': localized('Ataque = Defesa', 'Attack = Defense'),
        '1': localized('Ataque > Defesa', 'Attack > Defense'),
      }[String(value.relativePhysicalStats)] ??
        localized('Comparação de atributos', 'Stat comparison'),
      Swords,
    );
  if (value.partySpecies)
    add(`${words(value.partySpecies)} ${localized('na equipe', 'in the party')}`, Users);
  if (value.partyType)
    add(
      `${localized('Tipo', 'Type')} ${TYPE_TRANSLATIONS[value.partyType] ?? value.partyType} ${localized('na equipe', 'in the party')}`,
      Users,
    );
  if (value.tradeSpecies)
    add(`${localized('Trocar por', 'Trade for')} ${words(value.tradeSpecies)}`, ArrowLeftRight);
  return (
    <div className="evolution-requirements">
      {tags.map(({ text, Icon }, index) => (
        <span key={`${text}-${index}`} className="evolution-requirement">
          <Icon aria-hidden="true" className="h-3 w-3 shrink-0" />
          {text}
        </span>
      ))}
    </div>
  );
}

export function EvolutionRequirements({ conditions }: { conditions: EvolutionCondition[] }) {
  if (!conditions.length) return null;
  if (conditions.length === 1) return <Conditions value={conditions[0]} />;
  return (
    <div className="evolution-method-options">
      <Conditions value={conditions[0]} />
      <details className="evolution-alternatives">
        <summary>
          {localized('Outras condições', 'Other conditions')} ({conditions.length - 1})
        </summary>
        <div className="mt-3 space-y-3">
          {conditions.slice(1).map((value, i) => (
            <div key={i}>
              <p className="mb-2 text-center text-[10px] uppercase tracking-wider text-muted-foreground">
                {localized('ou', 'or')}
              </p>
              <Conditions value={value} />
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
