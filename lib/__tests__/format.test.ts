import { dayKey, isInMonth, isSameMonth, shiftMonth } from '../format';
import { growthFor } from '../growth';

describe('dayKey', () => {
  /**
   * Kézenfekvő lenne az ISO string első 10 karakterét levágni, de az UTC
   * szerint vágna: egy este 10-kor rögzített tétel nyáron a következő napra
   * esne, és eltörné a sorozatszámítást.
   */
  it('helyi idő szerint azonosítja a napot, késő este is', () => {
    const lateEvening = new Date(2026, 7, 11, 22, 30, 0);
    expect(dayKey(lateEvening)).toBe('2026-08-11');
  });

  it('nullákkal tölti fel a hónapot és a napot', () => {
    expect(dayKey(new Date(2026, 0, 5, 12, 0, 0))).toBe('2026-01-05');
  });
});

describe('shiftMonth', () => {
  it('előre lép a hónapok között', () => {
    expect(shiftMonth({ year: 2026, month: 5 }, 1)).toEqual({ year: 2026, month: 6 });
  });

  it('átfordul az év végén', () => {
    expect(shiftMonth({ year: 2026, month: 11 }, 1)).toEqual({ year: 2027, month: 0 });
  });

  it('visszafelé is átfordul', () => {
    expect(shiftMonth({ year: 2026, month: 0 }, -1)).toEqual({ year: 2025, month: 11 });
  });

  it('több hónapot is lép egyszerre', () => {
    expect(shiftMonth({ year: 2026, month: 1 }, -3)).toEqual({ year: 2025, month: 10 });
  });
});

describe('isInMonth és isSameMonth', () => {
  it('felismeri az adott hónapba eső dátumot', () => {
    const iso = new Date(2026, 7, 20, 12, 0, 0).toISOString();
    expect(isInMonth(iso, { year: 2026, month: 7 })).toBe(true);
    expect(isInMonth(iso, { year: 2026, month: 8 })).toBe(false);
    expect(isInMonth(iso, { year: 2025, month: 7 })).toBe(false);
  });

  it('összehasonlít két hónapot', () => {
    expect(isSameMonth({ year: 2026, month: 7 }, { year: 2026, month: 7 })).toBe(true);
    expect(isSameMonth({ year: 2026, month: 7 }, { year: 2027, month: 7 })).toBe(false);
  });
});

describe('growthFor', () => {
  it('nulla napnál a magnál tart', () => {
    const growth = growthFor(0);
    expect(growth.stage.name).toBe('Mag');
    expect(growth.daysToNext).toBe(1);
  });

  it('a küszöbök szerint lépteti a szintet', () => {
    expect(growthFor(1).stage.name).toBe('Csíra');
    expect(growthFor(2).stage.name).toBe('Csíra');
    expect(growthFor(3).stage.name).toBe('Hajtás');
    expect(growthFor(7).stage.name).toBe('Bimbó');
    expect(growthFor(14).stage.name).toBe('Virág');
    expect(growthFor(30).stage.name).toBe('Fa');
  });

  it('a legmagasabb szinten nincs következő', () => {
    const growth = growthFor(100);
    expect(growth.stage.name).toBe('Fa');
    expect(growth.next).toBeNull();
    expect(growth.progress).toBe(1);
    expect(growth.daysToNext).toBe(0);
  });

  it('a haladás mindig 0 és 1 közé esik', () => {
    for (let days = 0; days <= 40; days += 1) {
      const { progress } = growthFor(days);
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(1);
    }
  });

  it('a szint felénél a haladás is fele körül van', () => {
    // Bimbó (7) és Virág (14) között a 10. nap kb. 43%.
    expect(growthFor(10).progress).toBeCloseTo(3 / 7, 5);
  });
});
