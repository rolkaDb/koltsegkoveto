import { BASE_CURRENCY, formatMoney } from './money';
import type { MonthRef } from './types';

export const MONTH_NAMES = [
  'január',
  'február',
  'március',
  'április',
  'május',
  'június',
  'július',
  'augusztus',
  'szeptember',
  'október',
  'november',
  'december',
];

/**
 * 12500 -> "12 500 Ft". Az összesítések mindig forintosak, ezért van
 * külön neve - a tényleges formázást a `formatMoney` végzi, hogy egy
 * helyen legyen a szabály.
 */
export function formatHuf(value: number): string {
  return formatMoney(value, BASE_CURRENCY);
}

export function formatDateObj(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}. ${pad(d.getMonth() + 1)}. ${pad(d.getDate())}.`;
}

/** "08. 11." - a listában elég a rövid alak, az évet a fejléc adja. */
export function formatDayShort(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(d.getMonth() + 1)}. ${pad(d.getDate())}.`;
}

/**
 * Napkulcs: "2026-08-11". Ez azonosít egy naptári napot.
 *
 * Szándékosan nem az ISO string első 10 karaktere: az UTC szerint vágna,
 * és a magyar időzónában az esti tételek egy nappal korábbra csúsznának.
 */
export function dayKey(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function dayKeyOf(iso: string): string {
  return dayKey(new Date(iso));
}

export function monthTitle(ref: MonthRef): string {
  return `${ref.year}. ${MONTH_NAMES[ref.month]}`;
}

export function currentMonth(): MonthRef {
  const d = new Date();
  return { year: d.getFullYear(), month: d.getMonth() };
}

/** Hónapléptetés. A Date konstruktor kezeli az év-átfordulást (-1 és 12 esetét). */
export function shiftMonth(ref: MonthRef, delta: number): MonthRef {
  const d = new Date(ref.year, ref.month + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() };
}

export function isSameMonth(a: MonthRef, b: MonthRef): boolean {
  return a.year === b.year && a.month === b.month;
}

/** Egy dátum a megadott hónapra esik-e. */
export function isInMonth(iso: string, ref: MonthRef): boolean {
  const d = new Date(iso);
  return d.getFullYear() === ref.year && d.getMonth() === ref.month;
}
