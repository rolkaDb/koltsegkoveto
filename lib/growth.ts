/**
 * A növekvő növény, ami a sorozatot jeleníti meg.
 *
 * Szándékosan a *könyvelési szokáshoz* kötjük, nem a költés mértékéhez:
 * egy olyan visszajelzés, ami a többet költést jutalmazná, rossz irányba
 * terelne. Itt az nő, amit tényleg érdemes építeni - a rendszeresség.
 */

export type Stage = {
  icon: string;
  name: string;
  /** Ennyi napos sorozattól tart itt a növény. */
  minDays: number;
  message: string;
};

/** Növekvő sorrendben. A `growthFor` erre támaszkodik. */
export const STAGES: Stage[] = [
  {
    icon: '🌰',
    name: 'Mag',
    minDays: 0,
    message: 'Minden szokás egy magból indul. Rögzíts ma egy tételt.',
  },
  {
    icon: '🌱',
    name: 'Csíra',
    minDays: 1,
    message: 'Kibújt. Holnap is nézz rá, és megindul.',
  },
  {
    icon: '🌿',
    name: 'Hajtás',
    minDays: 3,
    message: 'Három nap. Már látszik, hogy komolyan gondolod.',
  },
  {
    icon: '🌷',
    name: 'Bimbó',
    minDays: 7,
    message: 'Egy teljes hét. Innentől ez már szokás, nem feladat.',
  },
  {
    icon: '🌸',
    name: 'Virág',
    minDays: 14,
    message: 'Két hét megszakítás nélkül. Szép munka.',
  },
  {
    icon: '🌳',
    name: 'Fa',
    minDays: 30,
    message: 'Egy hónap. Ezt már nem kell erőltetned — a tiéd.',
  },
];

export type Growth = {
  stage: Stage;
  /** A következő szint, vagy `null`, ha a legmagasabbnál tartunk. */
  next: Stage | null;
  /** Haladás a következő szintig, 0 és 1 között. A csúcson mindig 1. */
  progress: number;
  /** Hány nap hiányzik a következő szinthez. A csúcson 0. */
  daysToNext: number;
};

export function growthFor(days: number): Growth {
  // Az utolsó olyan szint, aminek a küszöbét már elértük.
  let index = 0;
  for (let i = 0; i < STAGES.length; i += 1) {
    if (days >= STAGES[i].minDays) index = i;
  }

  const stage = STAGES[index];
  const next = index < STAGES.length - 1 ? STAGES[index + 1] : null;

  if (!next) {
    return { stage, next: null, progress: 1, daysToNext: 0 };
  }

  const span = next.minDays - stage.minDays;
  const done = days - stage.minDays;

  return {
    stage,
    next,
    progress: Math.min(Math.max(done / span, 0), 1),
    daysToNext: Math.max(next.minDays - days, 0),
  };
}
