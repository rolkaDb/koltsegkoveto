import {
  normalizeAppearance,
  normalizeEntries,
  normalizeRecurring,
  normalizeSettings,
} from '../storage';

describe('normalizeEntries', () => {
  const valid = {
    id: '1',
    amount: 3500,
    category: 'Élelmiszer',
    note: 'bolt',
    date: '2026-08-11T10:00:00.000Z',
    kind: 'expense',
  };

  it('a nem tömb bemenetre üres listát ad', () => {
    expect(normalizeEntries(null)).toEqual([]);
    expect(normalizeEntries('adat')).toEqual([]);
    expect(normalizeEntries({})).toEqual([]);
  });

  /** A bevétel-funkció előtti mentésekben nincs `kind` mező. */
  it('a régi, kind nélküli tételeket kiadásnak veszi', () => {
    const { kind, ...withoutKind } = valid;
    expect(normalizeEntries([withoutKind])[0].kind).toBe('expense');
  });

  it('megőrzi a bevétel jelölést', () => {
    expect(normalizeEntries([{ ...valid, kind: 'income' }])[0].kind).toBe('income');
  });

  it('kidobja a nulla vagy hiányzó összegű tételeket', () => {
    expect(normalizeEntries([{ ...valid, amount: 0 }])).toHaveLength(0);
    expect(normalizeEntries([{ ...valid, amount: 'sok' }])).toHaveLength(0);
  });

  /**
   * Az érvénytelen dátumú tétel egyetlen hónapban sem jelenne meg, de ott
   * ülne a tárolóban és a számlálókban - "szellemtétel" lenne.
   */
  it('kidobja az értelmezhetetlen dátumú tételeket', () => {
    expect(normalizeEntries([{ ...valid, date: 'tegnap' }])).toHaveLength(0);
    expect(normalizeEntries([{ ...valid, date: '' }])).toHaveLength(0);
  });

  it('nem tárol pénznemet, ha az forint', () => {
    const [entry] = normalizeEntries([{ ...valid, currency: 'HUF' }]);
    expect(entry.currency).toBeUndefined();
  });

  it('megőrzi az idegen pénznemet és az ismétlődés-jelölést', () => {
    const [entry] = normalizeEntries([
      { ...valid, currency: 'EUR', recurringId: 'r1' },
    ]);

    expect(entry.currency).toBe('EUR');
    expect(entry.recurringId).toBe('r1');
  });

  it('a hiányzó mezőket ésszerű alapértékkel tölti', () => {
    const [entry] = normalizeEntries([{ amount: 100, date: valid.date }]);
    expect(entry.category).toBe('Egyéb');
    expect(entry.note).toBe('');
    expect(entry.id).toBeTruthy();
  });
});

describe('normalizeRecurring', () => {
  const valid = {
    id: 'r1',
    amount: 4990,
    category: 'Szórakozás',
    note: 'Netflix',
    kind: 'expense',
    dayOfMonth: 5,
    start: { year: 2026, month: 5 },
    end: null,
  };

  it('kidobja a kezdő hónap nélküli szabályt', () => {
    const { start, ...withoutStart } = valid;
    expect(normalizeRecurring([withoutStart])).toHaveLength(0);
  });

  it('kidobja az érvénytelen hónapszámot', () => {
    expect(normalizeRecurring([{ ...valid, start: { year: 2026, month: 12 } }])).toHaveLength(0);
  });

  it('1 és 31 közé szorítja a hónap napját', () => {
    expect(normalizeRecurring([{ ...valid, dayOfMonth: 99 }])[0].dayOfMonth).toBe(31);
    expect(normalizeRecurring([{ ...valid, dayOfMonth: 0 }])[0].dayOfMonth).toBe(1);
  });

  it('megőrzi a kihagyott hónapokat', () => {
    const rules = normalizeRecurring([{ ...valid, skipped: ['2026-6', '2026-7'] }]);
    expect(rules[0].skipped).toEqual(['2026-6', '2026-7']);
  });

  it('a hiányzó kihagyás-listát üresre állítja', () => {
    expect(normalizeRecurring([valid])[0].skipped).toEqual([]);
  });
});

describe('normalizeSettings', () => {
  it('hiányzó adatnál alapértékeket ad', () => {
    const settings = normalizeSettings({});
    expect(settings.monthlyBudget).toBeNull();
    expect(settings.noSpendDays).toEqual([]);
    expect(settings.currencies).toEqual([]);
  });

  it('csak a pozitív keretet fogadja el', () => {
    expect(normalizeSettings({ monthlyBudget: 200000 }).monthlyBudget).toBe(200000);
    expect(normalizeSettings({ monthlyBudget: 0 }).monthlyBudget).toBeNull();
    expect(normalizeSettings({ monthlyBudget: -5 }).monthlyBudget).toBeNull();
  });

  it('kiszűri az érvénytelen pénznemeket', () => {
    const { currencies } = normalizeSettings({
      currencies: [
        { code: 'EUR', rate: 410 },
        { code: 'HUF', rate: 1 }, // az alap pénznem nem szerepelhet itt
        { code: 'euro', rate: 410 }, // rossz formátum
        { code: 'USD', rate: 0 }, // érvénytelen árfolyam
      ],
    });

    expect(currencies).toEqual([{ code: 'EUR', rate: 410 }]);
  });
});

describe('normalizeAppearance', () => {
  it('érvénytelen erősségnél a közepesre esik vissza', () => {
    expect(normalizeAppearance({ intensity: 'nagyon' }).intensity).toBe('normal');
  });

  it('megőrzi az érvényes beállítást', () => {
    const appearance = normalizeAppearance({ palette: 'Levendula', intensity: 'deep' });
    expect(appearance).toEqual({ palette: 'Levendula', intensity: 'deep' });
  });
});
