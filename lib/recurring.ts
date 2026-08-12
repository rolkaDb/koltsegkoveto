import { isInMonth } from './format';
import type { Entry, MonthRef, Recurring } from './types';

/** Hány napos az adott hónap. A 0. nap az előző hónap utolsó napja. */
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Hónapok folytonos sorszáma, hogy egyszerű ciklussal lehessen lépkedni. */
function monthIndex(ref: MonthRef): number {
  return ref.year * 12 + ref.month;
}

/** Hónapkulcs a kihagyott hónapok nyilvántartásához: "2026-7". */
export function monthKey(ref: MonthRef): string {
  return `${ref.year}-${ref.month}`;
}

export function monthKeyOfDate(iso: string): string {
  const d = new Date(iso);
  return monthKey({ year: d.getFullYear(), month: d.getMonth() });
}

/**
 * Kiszámolja, mely tételek hiányoznak még az ismétlődő szabályokból.
 *
 * A szabály kezdő hónapjától a mai hónapig (vagy a végdátumig) végigmegyünk,
 * és ahol még nincs az adott szabályból származó tétel, ott létrehozzuk.
 * Jövőbeli dátumra nem generálunk - a hónap közepén nem írjuk elő,
 * mi lesz a hónap végén.
 *
 * Két apróság, ami könnyen elrontható:
 * - A 31-i szabály februárban a hónap utolsó napjára csúszik (`Math.min`).
 * - A dátum déli 12 órára áll be, nem éjfélre: így semmilyen időzóna-
 *   vagy nyáriidő-eltolás nem viszi át a tételt a szomszédos napra.
 */
export function generateDueEntries(
  rules: Recurring[],
  entries: Entry[],
  now = new Date()
): Entry[] {
  const created: Entry[] = [];
  const nowIdx = monthIndex({ year: now.getFullYear(), month: now.getMonth() });

  for (const rule of rules) {
    const startIdx = monthIndex(rule.start);
    const lastIdx = Math.min(rule.end ? monthIndex(rule.end) : nowIdx, nowIdx);

    for (let idx = startIdx; idx <= lastIdx; idx += 1) {
      const year = Math.floor(idx / 12);
      const month = idx % 12;
      const ref = { year, month };

      // A felhasználó szándékosan törölte vagy elmozgatta ezt a hónapot.
      if (rule.skipped?.includes(monthKey(ref))) continue;

      const alreadyThere =
        entries.some((e) => e.recurringId === rule.id && isInMonth(e.date, ref)) ||
        created.some((e) => e.recurringId === rule.id && isInMonth(e.date, ref));

      if (alreadyThere) continue;

      const day = Math.min(rule.dayOfMonth, daysInMonth(year, month));
      const date = new Date(year, month, day, 12, 0, 0);

      if (date > now) continue;

      created.push({
        id: `${rule.id}-${year}-${month}`,
        amount: rule.amount,
        category: rule.category,
        note: rule.note,
        date: date.toISOString(),
        kind: rule.kind,
        recurringId: rule.id,
      });
    }
  }

  return created;
}
