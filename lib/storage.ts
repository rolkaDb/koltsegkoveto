import AsyncStorage from '@react-native-async-storage/async-storage';

import { BASE_CURRENCY, isValidCode, type Currency } from './money';
import type { Entry, EntryKind, MonthRef, Recurring } from './types';
import type { Intensity } from './theme';
import { DEFAULT_PALETTE } from './theme';

const ENTRIES_KEY = 'koltsegkoveto.expenses.v1';
const APPEARANCE_KEY = 'koltsegkoveto.appearance.v1';
const SETTINGS_KEY = 'koltsegkoveto.settings.v1';
const RECURRING_KEY = 'koltsegkoveto.recurring.v1';

export type Appearance = { palette: string; intensity: Intensity };

export const DEFAULT_APPEARANCE: Appearance = {
  palette: DEFAULT_PALETTE,
  intensity: 'normal',
};

export type Settings = {
  /** Havi költési keret forintban. `null` = nincs beállítva. */
  monthlyBudget: number | null;
  /** Napkulcsok ("2026-08-11"), amiket költésmentesnek jelöltél. */
  noSpendDays: string[];
  /** A HUF mellett használható pénznemek, árfolyammal. */
  currencies: Currency[];
};

export const DEFAULT_SETTINGS: Settings = {
  monthlyBudget: null,
  noSpendDays: [],
  currencies: [],
};

/**
 * Betöltéskor mindent ellenőrzünk és kiegészítünk.
 *
 * Ez egyben a migráció is: a korábbi mentésekben még nem volt `kind` mező,
 * mert csak kiadásokat lehetett rögzíteni. Azok most kiadásként élnek tovább,
 * így senki nem veszít adatot a bevétel-funkció bevezetésével.
 */
export function normalizeEntries(raw: unknown): Entry[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter((e): e is Record<string, unknown> => !!e && typeof e === 'object')
    .map((e) => ({
      id: String(e.id ?? `${Date.now()}-${Math.random()}`),
      amount: Number(e.amount) || 0,
      category: String(e.category ?? 'Egyéb'),
      note: String(e.note ?? ''),
      date: typeof e.date === 'string' ? e.date : new Date().toISOString(),
      kind: (e.kind === 'income' ? 'income' : 'expense') as EntryKind,
      ...(typeof e.currency === 'string' && e.currency !== BASE_CURRENCY
        ? { currency: e.currency }
        : {}),
      ...(typeof e.recurringId === 'string' ? { recurringId: e.recurringId } : {}),
    }))
    // Az érvénytelen dátumú tétel egyetlen hónapban sem jelenne meg, de ott
    // ülne a tárolóban és a számlálókban - jobb, ha ki sem kerül a listába.
    .filter((e) => e.amount > 0 && !Number.isNaN(new Date(e.date).getTime()));
}

/** Ugyanaz az elv, mint a tételeknél: sérült szabály essen ki, ne döntsön el mindent. */
export function normalizeRecurring(raw: unknown): Recurring[] {
  if (!Array.isArray(raw)) return [];

  const asMonth = (v: unknown): MonthRef | null => {
    if (!v || typeof v !== 'object') return null;
    const m = v as Record<string, unknown>;
    const year = Number(m.year);
    const month = Number(m.month);
    if (!Number.isInteger(year) || !Number.isInteger(month)) return null;
    if (month < 0 || month > 11) return null;
    return { year, month };
  };

  return raw
    .filter((r): r is Record<string, unknown> => !!r && typeof r === 'object')
    .map((r): Recurring | null => {
      const start = asMonth(r.start);
      if (!start) return null;

      return {
        id: String(r.id ?? `${Date.now()}-${Math.random()}`),
        amount: Number(r.amount) || 0,
        category: String(r.category ?? 'Egyéb'),
        note: String(r.note ?? ''),
        kind: (r.kind === 'income' ? 'income' : 'expense') as EntryKind,
        dayOfMonth: Math.min(Math.max(Number(r.dayOfMonth) || 1, 1), 31),
        start,
        end: asMonth(r.end),
        skipped: Array.isArray(r.skipped)
          ? r.skipped.filter((s: unknown): s is string => typeof s === 'string')
          : [],
      };
    })
    .filter((r): r is Recurring => r !== null && r.amount > 0);
}

export async function loadRecurring(): Promise<Recurring[]> {
  const raw = await AsyncStorage.getItem(RECURRING_KEY);
  return raw ? normalizeRecurring(JSON.parse(raw)) : [];
}

export async function saveRecurring(rules: Recurring[]): Promise<void> {
  await AsyncStorage.setItem(RECURRING_KEY, JSON.stringify(rules));
}

export async function loadEntries(): Promise<Entry[]> {
  const raw = await AsyncStorage.getItem(ENTRIES_KEY);
  return raw ? normalizeEntries(JSON.parse(raw)) : [];
}

export async function saveEntries(entries: Entry[]): Promise<void> {
  await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
}

export function normalizeAppearance(parsed: unknown): Appearance {
  const a = (parsed ?? {}) as Record<string, unknown>;

  return {
    palette:
      typeof a.palette === 'string' ? a.palette : DEFAULT_APPEARANCE.palette,
    intensity:
      a.intensity === 'soft' || a.intensity === 'normal' || a.intensity === 'deep'
        ? a.intensity
        : DEFAULT_APPEARANCE.intensity,
  };
}

export async function loadAppearance(): Promise<Appearance> {
  const raw = await AsyncStorage.getItem(APPEARANCE_KEY);
  return raw ? normalizeAppearance(JSON.parse(raw)) : DEFAULT_APPEARANCE;
}

export async function saveAppearance(value: Appearance): Promise<void> {
  await AsyncStorage.setItem(APPEARANCE_KEY, JSON.stringify(value));
}

export function normalizeSettings(parsed: unknown): Settings {
  const s = (parsed ?? {}) as Record<string, unknown>;
  const budget = Number(s.monthlyBudget);

  const currencies: Currency[] = Array.isArray(s.currencies)
    ? s.currencies
        .map((c: unknown) => {
          const item = (c ?? {}) as Record<string, unknown>;
          const code = String(item.code ?? '').toUpperCase();
          const rate = Number(item.rate);
          if (!isValidCode(code) || code === BASE_CURRENCY) return null;
          if (!Number.isFinite(rate) || rate <= 0) return null;
          return { code, rate };
        })
        .filter((c): c is Currency => c !== null)
    : [];

  return {
    monthlyBudget: Number.isFinite(budget) && budget > 0 ? budget : null,
    noSpendDays: Array.isArray(s.noSpendDays)
      ? s.noSpendDays.filter((d: unknown): d is string => typeof d === 'string')
      : [],
    currencies,
  };
}

export async function loadSettings(): Promise<Settings> {
  const raw = await AsyncStorage.getItem(SETTINGS_KEY);
  return raw ? normalizeSettings(JSON.parse(raw)) : DEFAULT_SETTINGS;
}

export async function saveSettings(value: Settings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(value));
}
