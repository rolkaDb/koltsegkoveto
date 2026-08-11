import { dayKey } from './format';

export type Streak = {
  /** Hány egymást követő napon volt bejegyzés. */
  days: number;
  /** Ma történt-e már valami. Ha nem, a sorozat még megmenthető. */
  todayLogged: boolean;
};

/**
 * Sorozat: hány napja könyvelsz megszakítás nélkül.
 *
 * Egy nap akkor "aktív", ha van rajta tétel, vagy megjelölted
 * költésmentesnek. A mai nap külön eset: ha ma még nincs semmi,
 * nem nullázzuk le a sorozatot, hanem a tegnapitól számolunk
 * visszafelé - így a nap folyamán még pótolható. Ezt jelzi a
 * `todayLogged`, amiből a felület finom emlékeztetőt ír ki.
 */
export function computeStreak(activeDays: Set<string>, now = new Date()): Streak {
  const todayLogged = activeDays.has(dayKey(now));

  const cursor = new Date(now);
  if (!todayLogged) cursor.setDate(cursor.getDate() - 1);

  let days = 0;
  while (activeDays.has(dayKey(cursor))) {
    days += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return { days, todayLogged };
}
