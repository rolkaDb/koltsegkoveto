/**
 * Pénznemkezelés.
 *
 * A HUF az alap: minden összesítés forintban készül. A többi pénznemhez
 * a felhasználó ad meg árfolyamot (1 egység hány forint). Ez szándékosan
 * kézi: így az app hálózat nélkül is működik, és mindig átlátható, milyen
 * árfolyammal számoltunk - nem változik meg visszamenőleg egy régi hónap
 * összege attól, hogy közben mozdult az euró.
 */

export const BASE_CURRENCY = 'HUF';

export type Currency = {
  /** ISO 4217 kód, pl. "EUR". */
  code: string;
  /** Egy egység hány forint. */
  rate: number;
};

/** Hány tizedesjegyet mutatunk. A forintnál a fillér értelmetlen. */
function decimalsFor(code: string): number {
  return code === BASE_CURRENCY ? 0 : 2;
}

/**
 * Összeg megjelenítése. "12 500 Ft", illetve "12,50 EUR".
 * Kézzel formázunk, mert az Intl nem minden készüléken elérhető.
 */
export function formatMoney(amount: number, code: string = BASE_CURRENCY): string {
  const decimals = decimalsFor(code);
  const fixed = Math.abs(amount).toFixed(decimals);
  const [whole, fraction] = fixed.split('.');
  const spaced = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  const body = fraction ? `${spaced},${fraction}` : spaced;
  const sign = amount < 0 ? '−' : '';
  const suffix = code === BASE_CURRENCY ? 'Ft' : code;

  return `${sign}${body} ${suffix}`;
}

/**
 * Beírt szöveg -> összeg.
 *
 * Elfogadja a szóközzel tagolt és a vesszős alakot is ("1 250,50"),
 * mert magyar billentyűzeten az a természetes.
 *
 * @returns az összeg, vagy `null`, ha nem értelmezhető pozitív szám
 */
export function parseAmount(text: string): number | null {
  const cleaned = text.replace(/\s/g, '').replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;

  const value = Number(cleaned);
  return value > 0 ? value : null;
}

/**
 * Az adott pénznemben értelmes pontosságra kerekít.
 *
 * Ezt mentés előtt kell futtatni. Enélkül forintnál eltérne a tárolt és a
 * megjelenített érték: két 100,50-es tétel külön-külön "101 Ft"-nak látszana,
 * az összegük viszont 201 Ft lenne - a felhasználó szemével 202 helyett.
 */
export function roundForCurrency(amount: number, code: string): number {
  const factor = 10 ** decimalsFor(code);
  return Math.round(amount * factor) / factor;
}

/** ISO 4217 kód ellenőrzése: pontosan három nagybetű. */
export function isValidCode(code: string): boolean {
  return /^[A-Z]{3}$/.test(code);
}

export function rateOf(code: string, currencies: Currency[]): number {
  if (code === BASE_CURRENCY) return 1;
  return currencies.find((c) => c.code === code)?.rate ?? 1;
}

/**
 * Átváltás forintra.
 *
 * Ha egy pénznemet később törölnek, a hozzá tartozó régi tételek
 * 1-es árfolyammal számolnának. Ezt a hívó oldalon nem kezeljük külön:
 * a törlésnél figyelmeztetünk, ha van még ilyen tétel.
 */
export function toBase(amount: number, code: string, currencies: Currency[]): number {
  return amount * rateOf(code, currencies);
}
