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

const triggers: Record<string, string> = {
  'level-up': 'Subir de nível',
  trade: 'Troca',
  'use-item': 'Usar item',
  shed: 'Especial',
  spin: 'Girar',
  'tower-of-darkness': 'Torre da Escuridão',
  'tower-of-waters': 'Torre das Águas',
  'three-critical-hits': '3 golpes críticos',
  'take-damage': 'Receber dano',
  other: 'Condição especial',
  'agile-style-move': 'Golpe em estilo ágil',
  'strong-style-move': 'Golpe em estilo forte',
  'recoil-damage': 'Dano de recuo',
};
const words = (value: string) => value.replace(/-/g, ' ');

function Conditions({ value }: { value: EvolutionCondition }) {
  const tags: { text: string; Icon: LucideIcon }[] = [];
  const add = (text: string, Icon: LucideIcon = Sparkles) => tags.push({ text, Icon });
  if (value.minLevel !== null) add(`Nível ${value.minLevel}`);
  if (value.trigger && (value.trigger !== 'level-up' || value.minLevel === null))
    add(
      triggers[value.trigger] ?? words(value.trigger),
      value.trigger === 'trade' ? ArrowLeftRight : Sparkles,
    );
  if (value.item) add(words(value.item), Gem);
  if (value.heldItem) add(`Segurando ${words(value.heldItem)}`, Gem);
  if (value.minHappiness !== null) add(`Amizade ${value.minHappiness}+`, Heart);
  if (value.minAffection !== null) add(`Afeição ${value.minAffection}+`, Heart);
  if (value.timeOfDay)
    add(
      { day: 'Dia', night: 'Noite', dusk: 'Entardecer' }[value.timeOfDay] ?? words(value.timeOfDay),
      value.timeOfDay === 'night' ? Moon : Sun,
    );
  if (value.knownMove) add(`Saber ${words(value.knownMove)}`, Swords);
  if (value.knownMoveType)
    add(`Golpe ${TYPE_TRANSLATIONS[value.knownMoveType] ?? value.knownMoveType}`, Swords);
  if (value.location) add(words(value.location), MapPin);
  if (value.needsRain) add('Chuva', Droplets);
  if (value.turnUpsideDown) add('Console invertido', RotateCcw);
  if (value.gender === 1 || value.gender === 2) add(value.gender === 1 ? 'Fêmea' : 'Macho', Users);
  if (value.minBeauty !== null) add(`Beleza ${value.minBeauty}+`);
  if (value.relativePhysicalStats !== null)
    add(
      { '-1': 'Ataque < Defesa', '0': 'Ataque = Defesa', '1': 'Ataque > Defesa' }[
        String(value.relativePhysicalStats)
      ] ?? 'Comparação de atributos',
      Swords,
    );
  if (value.partySpecies) add(`${words(value.partySpecies)} na equipe`, Users);
  if (value.partyType)
    add(`Tipo ${TYPE_TRANSLATIONS[value.partyType] ?? value.partyType} na equipe`, Users);
  if (value.tradeSpecies) add(`Trocar por ${words(value.tradeSpecies)}`, ArrowLeftRight);
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
        <summary>Outras condições ({conditions.length - 1})</summary>
        <div className="mt-3 space-y-3">
          {conditions.slice(1).map((value, i) => (
            <div key={i}>
              <p className="mb-2 text-center text-[10px] uppercase tracking-wider text-muted-foreground">
                ou
              </p>
              <Conditions value={value} />
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
