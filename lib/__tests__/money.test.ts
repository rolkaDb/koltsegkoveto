import {
  formatMoney,
  isValidCode,
  parseAmount,
  rateOf,
  roundForCurrency,
  toBase,
} from '../money';

describe('parseAmount', () => {
  it('elfogadja az egyszerű egész számot', () => {
    expect(parseAmount('1200')).toBe(1200);
  });

  it('elfogadja a szóközzel tagolt alakot', () => {
    expect(parseAmount('1 200')).toBe(1200);
  });

  it('elfogadja a vesszős tizedest is - magyar billentyűzeten az a természetes', () => {
    expect(parseAmount('1 200,50')).toBe(1200.5);
    expect(parseAmount('12,5')).toBe(12.5);
  });

  it('elfogadja a pontos alakot is', () => {
    expect(parseAmount('1200.50')).toBe(1200.5);
  });

  it('elutasítja a nem szám bemenetet', () => {
    expect(parseAmount('')).toBeNull();
    expect(parseAmount('abc')).toBeNull();
    expect(parseAmount('12abc')).toBeNull();
  });

  it('elutasítja a nullát és a negatívot', () => {
    expect(parseAmount('0')).toBeNull();
    expect(parseAmount('-500')).toBeNull();
  });

  it('elutasítja a kettőnél több tizedest', () => {
    expect(parseAmount('1,234')).toBeNull();
  });
});

describe('formatMoney', () => {
  it('forintnál nincs tizedes, és szóközzel tagol', () => {
    expect(formatMoney(12500)).toBe('12 500 Ft');
    expect(formatMoney(1234567)).toBe('1 234 567 Ft');
    expect(formatMoney(0)).toBe('0 Ft');
  });

  it('más pénznemnél két tizedes van, vesszővel', () => {
    expect(formatMoney(49.9, 'EUR')).toBe('49,90 EUR');
    expect(formatMoney(1200, 'USD')).toBe('1 200,00 USD');
  });

  it('a negatív értéket tipográfiai mínusszal jelöli', () => {
    expect(formatMoney(-500)).toBe('−500 Ft');
  });
});

describe('roundForCurrency', () => {
  /**
   * Ez volt az a hiba, ahol két 100,50-es forintos tétel külön-külön
   * "101 Ft"-nak látszott, az összegük mégis 201 Ft lett.
   */
  it('forintnál egészre kerekít, hogy a tárolt és a látott érték egyezzen', () => {
    expect(roundForCurrency(100.5, 'HUF')).toBe(101);
    expect(roundForCurrency(100.4, 'HUF')).toBe(100);
  });

  it('más pénznemnél két tizedest hagy', () => {
    expect(roundForCurrency(1.234, 'EUR')).toBe(1.23);
    expect(roundForCurrency(1.236, 'EUR')).toBe(1.24);
  });

  it('a kerekített érték ugyanazt adja formázva, mint amit tárolunk', () => {
    const stored = roundForCurrency(100.5, 'HUF');
    expect(formatMoney(stored)).toBe(formatMoney(100.5));
  });
});

describe('árfolyam', () => {
  const currencies = [
    { code: 'EUR', rate: 410 },
    { code: 'USD', rate: 380 },
  ];

  it('a forint árfolyama mindig 1', () => {
    expect(rateOf('HUF', currencies)).toBe(1);
    expect(rateOf('HUF', [])).toBe(1);
  });

  it('ismert pénznemnél a beállított értéket adja', () => {
    expect(rateOf('EUR', currencies)).toBe(410);
  });

  it('ismeretlen pénznemnél 1-re esik vissza', () => {
    expect(rateOf('GBP', currencies)).toBe(1);
  });

  it('forintra vált', () => {
    expect(toBase(50, 'EUR', currencies)).toBe(20500);
    expect(toBase(1000, 'HUF', currencies)).toBe(1000);
  });
});

describe('isValidCode', () => {
  it('pontosan három nagybetűt fogad el', () => {
    expect(isValidCode('EUR')).toBe(true);
    expect(isValidCode('eur')).toBe(false);
    expect(isValidCode('EURO')).toBe(false);
    expect(isValidCode('EU')).toBe(false);
    expect(isValidCode('E1R')).toBe(false);
  });
});
