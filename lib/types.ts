/** Kiadás vagy bevétel. */
export type EntryKind = 'expense' | 'income';

/** Egy tétel. A `date` ISO string, mert azt könnyű tárolni és rendezni. */
export type Entry = {
  id: string;
  amount: number;
  category: string;
  note: string;
  date: string;
  kind: EntryKind;
  /**
   * ISO 4217 kód. Hiányzik a régi tételekből - azok forintosak.
   * Az `amount` mindig ebben a pénznemben értendő.
   */
  currency?: string;
  /**
   * Ha ismétlődő szabályból keletkezett, itt a szabály azonosítója.
   * Ebből tudjuk, hogy egy adott hónapra már generáltunk-e tételt.
   */
  recurringId?: string;
};

/** Egy hónap azonosítója. A `month` 0-tól 11-ig megy, ahogy a JS Date-ben. */
export type MonthRef = { year: number; month: number };

/** Ismétlődő tétel szabálya: minden hónap adott napján keletkezik belőle egy tétel. */
export type Recurring = {
  id: string;
  amount: number;
  category: string;
  note: string;
  kind: EntryKind;
  /** A hónap hányadik napján. Rövidebb hónapoknál az utolsó napra csúszik. */
  dayOfMonth: number;
  /** Az első hónap, amire generálunk. */
  start: MonthRef;
  /** Az utolsó hónap, vagy `null`, ha határozatlan. */
  end: MonthRef | null;
  /**
   * Hónapkulcsok ("2026-7"), amelyekre szándékosan nem generálunk.
   *
   * Ide kerül a hónap, ha a felhasználó törli az adott hónap tételét,
   * vagy más hónapra mozgatja. Enélkül a generálás minden indításkor
   * visszahozná, hiszen csak azt látja, hogy "ebben a hónapban nincs tétel".
   */
  skipped?: string[];
};
