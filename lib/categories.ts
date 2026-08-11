import type { EntryKind } from './types';

export type Category = { name: string; icon: string; tint: string };

export const EXPENSE_CATEGORIES: Category[] = [
  { name: 'Élelmiszer', icon: '🛒', tint: '#FDE4EC' },
  { name: 'Étterem', icon: '🍽️', tint: '#FFEEDF' },
  { name: 'Közlekedés', icon: '🚌', tint: '#E6EFFA' },
  { name: 'Lakhatás', icon: '🏠', tint: '#ECE7FA' },
  { name: 'Szórakozás', icon: '🎬', tint: '#FCE6F4' },
  { name: 'Egészség', icon: '🌿', tint: '#E4F3EA' },
  { name: 'Egyéb', icon: '✨', tint: '#F2EFEA' },
];

export const INCOME_CATEGORIES: Category[] = [
  { name: 'Fizetés', icon: '💼', tint: '#E2F1E8' },
  { name: 'Megbízás', icon: '🧾', tint: '#E6EFFA' },
  { name: 'Hozam', icon: '📈', tint: '#E9F0DF' },
  { name: 'Ajándék', icon: '🎁', tint: '#FCE6F4' },
  { name: 'Egyéb bevétel', icon: '✨', tint: '#F2EFEA' },
];

export function categoriesFor(kind: EntryKind): Category[] {
  return kind === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}

/**
 * Névből kategória. A tárolt adat csak a nevet őrzi, ezért ha egyszer
 * átnevezünk vagy törlünk egy kategóriát, a régi tételek se törjenek el.
 */
export function categoryOf(name: string, kind: EntryKind): Category {
  return (
    categoriesFor(kind).find((c) => c.name === name) ?? {
      name,
      icon: kind === 'income' ? '💰' : '•',
      tint: 'rgba(150,150,150,0.15)',
    }
  );
}
