import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

export interface ComparePokemon {
  id: number;
  name: string;
  sprite: string;
  types: string[];
}

interface CompareContextType {
  selected: ComparePokemon[];
  add: (pokemon: ComparePokemon) => void;
  remove: (id: number) => void;
  clear: () => void;
  isSelected: (id: number) => boolean;
  isFull: boolean;
}

const CompareContext = createContext<CompareContextType | null>(null);

const STORAGE_KEY = 'pokemon-compare';

export function CompareProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<ComparePokemon[]>(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(selected));
  }, [selected]);

  const add = useCallback((pokemon: ComparePokemon) => {
    setSelected(prev => {
      if (prev.length >= 3 || prev.some(p => p.id === pokemon.id)) return prev;
      return [...prev, pokemon];
    });
  }, []);

  const remove = useCallback((id: number) => {
    setSelected(prev => prev.filter(p => p.id !== id));
  }, []);

  const clear = useCallback(() => setSelected([]), []);

  const isSelected = useCallback((id: number) => selected.some(p => p.id === id), [selected]);

  return (
    <CompareContext.Provider value={{ selected, add, remove, clear, isSelected, isFull: selected.length >= 3 }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be used within CompareProvider');
  return ctx;
}
