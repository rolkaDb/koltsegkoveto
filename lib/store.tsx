import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { BackupData } from './backup';
import { currentMonth, dayKey, dayKeyOf, isInMonth } from './format';
import {
  DEFAULT_APPEARANCE,
  DEFAULT_SETTINGS,
  loadAppearance,
  loadEntries,
  loadRecurring,
  loadSettings,
  saveAppearance,
  saveEntries,
  saveRecurring,
  saveSettings,
  type Appearance,
  type Settings,
} from './storage';
import { BASE_CURRENCY, toBase } from './money';
import { generateDueEntries, monthKeyOfDate } from './recurring';
import { computeStreak, type Streak } from './streak';
import { buildTheme, type Intensity, type Theme } from './theme';
import type { Entry, MonthRef, Recurring } from './types';

/** Egy kategória havi összesítése. */
export type CategorySum = { name: string; sum: number; share: number };

type AppState = {
  loaded: boolean;

  entries: Entry[];
  addEntry: (input: Omit<Entry, 'id'>) => void;
  updateEntry: (id: string, patch: Partial<Omit<Entry, 'id'>>) => void;
  removeEntry: (id: string) => void;

  /** A vizsgált hónap. Minden fül ezt osztja, ezért itt él. */
  month: MonthRef;
  setMonth: (value: MonthRef) => void;

  theme: Theme;
  appearance: Appearance;
  setPalette: (name: string) => void;
  setIntensity: (value: Intensity) => void;

  recurring: Recurring[];
  addRecurring: (input: Omit<Recurring, 'id'>) => void;
  removeRecurring: (id: string) => void;

  /** Mentésből visszatöltés: a jelenlegi adatok helyére lép. */
  restoreBackup: (data: BackupData) => void;

  settings: Settings;
  setMonthlyBudget: (value: number | null) => void;
  addCurrency: (code: string, rate: number) => void;
  updateCurrencyRate: (code: string, rate: number) => void;
  removeCurrency: (code: string) => void;
  /** A mai napot költésmentesnek jelöli, vagy visszavonja a jelölést. */
  toggleNoSpendToday: () => void;

  monthEntries: Entry[];
  income: number;
  spent: number;
  balance: number;
  byCategory: CategorySum[];

  streak: Streak;
  todayHasEntry: boolean;
  todayNoSpend: boolean;
};

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [appearance, setAppearance] = useState<Appearance>(DEFAULT_APPEARANCE);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [recurring, setRecurring] = useState<Recurring[]>([]);
  const [month, setMonth] = useState<MonthRef>(currentMonth);
  const [loaded, setLoaded] = useState(false);

  // Induláskor egyszer: visszatöltjük a mentett tételeket és a megjelenést.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [storedEntries, storedAppearance, storedSettings, storedRecurring] =
          await Promise.all([
            loadEntries(),
            loadAppearance(),
            loadSettings(),
            loadRecurring(),
          ]);

        if (cancelled) return;
        setEntries(storedEntries);
        setAppearance(storedAppearance);
        setSettings(storedSettings);
        setRecurring(storedRecurring);
      } catch (err) {
        console.warn('Nem sikerult betolteni a mentett adatokat:', err);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Minden változásnál mentünk - de csak a betöltés után, különben
  // az induló üres lista felülírná a tárolóban lévő valódi adatot.
  useEffect(() => {
    if (!loaded) return;
    saveEntries(entries).catch((err) =>
      console.warn('Nem sikerult menteni a tételeket:', err)
    );
  }, [entries, loaded]);

  useEffect(() => {
    if (!loaded) return;
    saveAppearance(appearance).catch((err) =>
      console.warn('Nem sikerult menteni a megjelenest:', err)
    );
  }, [appearance, loaded]);

  useEffect(() => {
    if (!loaded) return;
    saveSettings(settings).catch((err) =>
      console.warn('Nem sikerult menteni a beallitasokat:', err)
    );
  }, [settings, loaded]);

  useEffect(() => {
    if (!loaded) return;
    saveRecurring(recurring).catch((err) =>
      console.warn('Nem sikerult menteni az ismetlodo teteleket:', err)
    );
  }, [recurring, loaded]);

  /**
   * Az esedékes ismétlődő tételek pótlása.
   *
   * A függőségek között szándékosan NINCS ott az `entries`: a hatás
   * tételeket hoz létre, tehát az `entries` változása újraindítaná
   * önmagát. Ehelyett a `setEntries` függvényalakját használjuk, és ha
   * nincs mit pótolni, változatlanul adjuk vissza az előző tömböt -
   * így React nem is renderel újra.
   */
  useEffect(() => {
    if (!loaded) return;

    setEntries((prev) => {
      const due = generateDueEntries(recurring, prev);
      return due.length > 0 ? [...due, ...prev] : prev;
    });
  }, [recurring, loaded]);

  const addEntry = useCallback((input: Omit<Entry, 'id'>) => {
    const entry: Entry = { ...input, id: Date.now().toString() };
    setEntries((prev) => [entry, ...prev]);

    // Ugorjunk a tétel hónapjára, különben úgy tűnne, hogy eltűnt.
    const d = new Date(entry.date);
    setMonth({ year: d.getFullYear(), month: d.getMonth() });
  }, []);

  /**
   * Egy ismétlődő szabályból származó hónapot kihagyottnak jelöl.
   *
   * Enélkül a generálás minden appindításkor visszahozná a tételt: csak
   * azt látja, hogy abban a hónapban nincs az adott szabályból semmi -
   * azt nem, hogy ez szándékos volt.
   */
  const markSkipped = useCallback((recurringId: string, iso: string) => {
    const key = monthKeyOfDate(iso);

    setRecurring((prev) =>
      prev.map((r) =>
        r.id === recurringId && !r.skipped?.includes(key)
          ? { ...r, skipped: [...(r.skipped ?? []), key] }
          : r
      )
    );
  }, []);

  const updateEntry = useCallback(
    (id: string, patch: Partial<Omit<Entry, 'id'>>) => {
      const target = entries.find((e) => e.id === id);

      // Ha egy generált tételt más hónapra mozgatnak, az eredeti hónap
      // kihagyottá válik - különben oda újragenerálódna egy másolat.
      if (
        target?.recurringId &&
        patch.date &&
        monthKeyOfDate(patch.date) !== monthKeyOfDate(target.date)
      ) {
        markSkipped(target.recurringId, target.date);
      }

      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...patch } : e))
      );
    },
    [entries, markSkipped]
  );

  const removeEntry = useCallback(
    (id: string) => {
      const target = entries.find((e) => e.id === id);
      if (target?.recurringId) {
        markSkipped(target.recurringId, target.date);
      }

      setEntries((prev) => prev.filter((e) => e.id !== id));
    },
    [entries, markSkipped]
  );

  const setPalette = useCallback((palette: string) => {
    setAppearance((prev) => ({ ...prev, palette }));
  }, []);

  const setIntensity = useCallback((intensity: Intensity) => {
    setAppearance((prev) => ({ ...prev, intensity }));
  }, []);

  const addRecurring = useCallback((input: Omit<Recurring, 'id'>) => {
    setRecurring((prev) => [...prev, { ...input, id: Date.now().toString() }]);
  }, []);

  /**
   * A szabály törlése a jövőre szól: a már létrejött tételek megmaradnak,
   * mert azok megtörtént kiadások. Ha valaki a régieket is törölné,
   * azt a Tételek fülön teheti meg egyesével.
   */
  const removeRecurring = useCallback((id: string) => {
    setRecurring((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const restoreBackup = useCallback((data: BackupData) => {
    setEntries(data.entries);
    setRecurring(data.recurring);
    setSettings(data.settings);
    setAppearance(data.appearance);
    // A mentés más hónapból is származhat, ezért a mai hónapra állunk vissza.
    setMonth(currentMonth());
  }, []);

  const setMonthlyBudget = useCallback((monthlyBudget: number | null) => {
    setSettings((prev) => ({ ...prev, monthlyBudget }));
  }, []);

  const addCurrency = useCallback((code: string, rate: number) => {
    setSettings((prev) =>
      prev.currencies.some((c) => c.code === code)
        ? prev
        : { ...prev, currencies: [...prev.currencies, { code, rate }] }
    );
  }, []);

  const updateCurrencyRate = useCallback((code: string, rate: number) => {
    setSettings((prev) => ({
      ...prev,
      currencies: prev.currencies.map((c) => (c.code === code ? { ...c, rate } : c)),
    }));
  }, []);

  const removeCurrency = useCallback((code: string) => {
    setSettings((prev) => ({
      ...prev,
      currencies: prev.currencies.filter((c) => c.code !== code),
    }));
  }, []);

  const toggleNoSpendToday = useCallback(() => {
    const today = dayKey(new Date());

    setSettings((prev) => ({
      ...prev,
      noSpendDays: prev.noSpendDays.includes(today)
        ? prev.noSpendDays.filter((d) => d !== today)
        : [...prev.noSpendDays, today],
    }));
  }, []);

  const theme = useMemo(
    () => buildTheme(appearance.palette, appearance.intensity),
    [appearance.palette, appearance.intensity]
  );

  /** Csak a kiválasztott hónap tételei, legfrissebb elöl. */
  const monthEntries = useMemo(
    () =>
      entries
        .filter((e) => isInMonth(e.date, month))
        .sort((a, b) => b.date.localeCompare(a.date)),
    [entries, month]
  );

  /**
   * Az összesítések mindig forintban készülnek: a más pénznemű tételeket
   * a beállított árfolyammal váltjuk át. Enélkül egy 50 EUR és egy
   * 50 000 Ft tétel összeadva értelmetlen számot adna.
   */
  const { income, spent } = useMemo(() => {
    let income = 0;
    let spent = 0;

    for (const e of monthEntries) {
      const value = toBase(e.amount, e.currency ?? BASE_CURRENCY, settings.currencies);
      if (e.kind === 'income') income += value;
      else spent += value;
    }

    return { income, spent };
  }, [monthEntries, settings.currencies]);

  /**
   * Kategóriánkénti összesítés, csökkenő sorrendben.
   * Csak a kiadásokra - ott az a kérdés, hogy mire megy el a pénz.
   */
  const byCategory = useMemo(() => {
    const sums = new Map<string, number>();

    for (const e of monthEntries) {
      if (e.kind !== 'expense') continue;
      const value = toBase(e.amount, e.currency ?? BASE_CURRENCY, settings.currencies);
      sums.set(e.category, (sums.get(e.category) ?? 0) + value);
    }

    return Array.from(sums, ([name, sum]) => ({
      name,
      sum,
      share: spent > 0 ? sum / spent : 0,
    })).sort((a, b) => b.sum - a.sum);
  }, [monthEntries, spent, settings.currencies]);

  /**
   * Egy nap akkor "aktív", ha van rajta tétel, vagy költésmentesnek jelölted.
   * Ebből számoljuk a sorozatot.
   */
  const activeDays = useMemo(() => {
    const days = new Set(settings.noSpendDays);
    for (const e of entries) days.add(dayKeyOf(e.date));
    return days;
  }, [entries, settings.noSpendDays]);

  const streak = useMemo(() => computeStreak(activeDays), [activeDays]);

  const todayKey = dayKey(new Date());
  const todayHasEntry = useMemo(
    () => entries.some((e) => dayKeyOf(e.date) === todayKey),
    [entries, todayKey]
  );
  const todayNoSpend = settings.noSpendDays.includes(todayKey);

  const value: AppState = {
    loaded,
    entries,
    addEntry,
    updateEntry,
    removeEntry,
    month,
    setMonth,
    theme,
    appearance,
    setPalette,
    setIntensity,
    monthEntries,
    income,
    spent,
    balance: income - spent,
    byCategory,
    recurring,
    addRecurring,
    removeRecurring,
    restoreBackup,
    settings,
    setMonthlyBudget,
    addCurrency,
    updateCurrencyRate,
    removeCurrency,
    toggleNoSpendToday,
    streak,
    todayHasEntry,
    todayNoSpend,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp csak az AppProvider-en belül hívható.');
  }
  return ctx;
}

export function useTheme(): Theme {
  return useApp().theme;
}

/**
 * Témafüggő stíluslap.
 *
 * A `factory`-t modulszinten kell definiálni (ne a komponens testében),
 * különben minden rendereléskor új függvény lenne, és hiába a `useMemo`.
 */
export function useThemedStyles<T>(factory: (theme: Theme) => T): T {
  const theme = useTheme();
  return useMemo(() => factory(theme), [theme, factory]);
}
