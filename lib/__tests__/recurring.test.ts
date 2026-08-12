import { daysInMonth, generateDueEntries, monthKey } from '../recurring';
import type { Recurring } from '../types';

/** 2026. augusztus 15., dél. */
const NOW = new Date(2026, 7, 15, 12, 0, 0);

/** Alapszabály: minden hó 5-én, 2026 júniusától, határozatlan ideig. */
function rule(overrides: Partial<Recurring> = {}): Recurring {
  return {
    id: 'r1',
    amount: 4990,
    category: 'Szórakozás',
    note: 'Netflix',
    kind: 'expense',
    dayOfMonth: 5,
    start: { year: 2026, month: 5 },
    end: null,
    ...overrides,
  };
}

describe('generateDueEntries', () => {
  it('a kezdő hónaptól a mai hónapig pótol', () => {
    const created = generateDueEntries([rule()], [], NOW);

    expect(created).toHaveLength(3); // június, július, augusztus
    expect(created.every((e) => e.recurringId === 'r1')).toBe(true);
    expect(created.every((e) => e.amount === 4990)).toBe(true);
  });

  /** Ezért futtatható a generálás minden appindításkor. */
  it('nem hoz létre másodpéldányt a már meglévő tételek mellé', () => {
    const first = generateDueEntries([rule()], [], NOW);
    const second = generateDueEntries([rule()], first, NOW);

    expect(second).toHaveLength(0);
  });

  /**
   * Ez volt a kódátvizsgálás fő találata: a törölt tétel minden
   * indításkor visszaszületett, mert a generálás nem tudta, hogy
   * a hiánya szándékos.
   */
  it('kihagyja azokat a hónapokat, amiket a felhasználó törölt', () => {
    const skipped = rule({ skipped: [monthKey({ year: 2026, month: 6 })] });
    const created = generateDueEntries([skipped], [], NOW);

    expect(created).toHaveLength(2);
    expect(created.some((e) => new Date(e.date).getMonth() === 6)).toBe(false);
  });

  it('nem generál jövőbeli dátumra', () => {
    // A 25-e még nem jött el augusztusban (ma 15-e van).
    const created = generateDueEntries([rule({ dayOfMonth: 25 })], [], NOW);

    expect(created).toHaveLength(2); // csak június és július
  });

  it('a végdátum után nem generál', () => {
    const ended = rule({ end: { year: 2026, month: 5 } });
    const created = generateDueEntries([ended], [], NOW);

    expect(created).toHaveLength(1); // csak június
  });

  it('a rövidebb hónapban az utolsó napra csúszik', () => {
    const feb = rule({ dayOfMonth: 31, start: { year: 2026, month: 1 } });
    const created = generateDueEntries([feb], [], new Date(2026, 2, 1, 12, 0, 0));

    const februaryEntry = created.find((e) => new Date(e.date).getMonth() === 1);
    expect(februaryEntry).toBeDefined();
    expect(new Date(februaryEntry!.date).getDate()).toBe(28);
  });

  /**
   * Éjfél helyett delet használunk, hogy semmilyen időzóna-eltolás
   * ne vigye át a tételt a szomszédos napra.
   */
  it('a tételek dél körül keletkeznek, nem éjfélkor', () => {
    const created = generateDueEntries([rule()], [], NOW);

    for (const entry of created) {
      expect(new Date(entry.date).getHours()).toBe(12);
    }
  });

  it('több szabályt egyszerre kezel', () => {
    const other = rule({ id: 'r2', note: 'Spotify', dayOfMonth: 1 });
    const created = generateDueEntries([rule(), other], [], NOW);

    expect(created.filter((e) => e.recurringId === 'r1')).toHaveLength(3);
    expect(created.filter((e) => e.recurringId === 'r2')).toHaveLength(3);
  });
});

describe('daysInMonth', () => {
  it('ismeri a hónapok hosszát', () => {
    expect(daysInMonth(2026, 0)).toBe(31); // január
    expect(daysInMonth(2026, 1)).toBe(28); // február, nem szökőév
    expect(daysInMonth(2024, 1)).toBe(29); // február, szökőév
    expect(daysInMonth(2026, 3)).toBe(30); // április
  });
});
