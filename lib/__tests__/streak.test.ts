import { dayKey } from '../format';
import { computeStreak } from '../streak';

/** 2026. augusztus 11., dél. Fix időpont, hogy a teszt ne a mai naptól függjön. */
const NOW = new Date(2026, 7, 11, 12, 0, 0);

/** A `NOW`-hoz képest N nappal korábbi nap kulcsa. */
function ago(days: number): string {
  const d = new Date(NOW);
  d.setDate(d.getDate() - days);
  return dayKey(d);
}

describe('computeStreak', () => {
  it('üres előzménynél nincs sorozat', () => {
    expect(computeStreak(new Set(), NOW)).toEqual({ days: 0, todayLogged: false });
  });

  it('a mai bejegyzés egynapos sorozatot indít', () => {
    expect(computeStreak(new Set([ago(0)]), NOW)).toEqual({
      days: 1,
      todayLogged: true,
    });
  });

  it('összeszámolja az egymást követő napokat', () => {
    const days = new Set([ago(0), ago(1), ago(2)]);
    expect(computeStreak(days, NOW)).toEqual({ days: 3, todayLogged: true });
  });

  /**
   * Ez a megbocsátó viselkedés lényege: reggel, amikor még nincs mai
   * bejegyzés, ne nullázódjon le a tegnapig épített sorozat.
   */
  it('a mai hiányzó bejegyzés nem nullázza le a sorozatot', () => {
    const days = new Set([ago(1), ago(2), ago(3)]);
    expect(computeStreak(days, NOW)).toEqual({ days: 3, todayLogged: false });
  });

  it('a kihagyott nap megszakítja a sorozatot', () => {
    // Ma és tegnapelőtt van, tegnap nincs.
    const days = new Set([ago(0), ago(2), ago(3)]);
    expect(computeStreak(days, NOW).days).toBe(1);
  });

  it('ha se ma, se tegnap nincs bejegyzés, a sorozat nulla', () => {
    const days = new Set([ago(2), ago(3)]);
    expect(computeStreak(days, NOW)).toEqual({ days: 0, todayLogged: false });
  });

  it('átnyúlik a hónapfordulón', () => {
    const sept1 = new Date(2026, 8, 1, 12, 0, 0);
    const days = new Set([
      dayKey(sept1),
      dayKey(new Date(2026, 7, 31, 12, 0, 0)),
      dayKey(new Date(2026, 7, 30, 12, 0, 0)),
    ]);

    expect(computeStreak(days, sept1).days).toBe(3);
  });

  it('átnyúlik az évfordulón', () => {
    const jan1 = new Date(2027, 0, 1, 12, 0, 0);
    const days = new Set([
      dayKey(jan1),
      dayKey(new Date(2026, 11, 31, 12, 0, 0)),
    ]);

    expect(computeStreak(days, jan1).days).toBe(2);
  });
});
