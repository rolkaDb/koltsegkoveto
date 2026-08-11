/**
 * Színvilágok és a belőlük számolt téma.
 *
 * A paletták csak a *hangulatot* írják le (a háttér-átmenet alapszínei és
 * a kiemelőszín). Minden más - szövegszínek, kártya, elválasztó - ebből
 * származik, hogy egy új paletta hozzáadása három sor legyen, ne harminc.
 */

/** Talpas betűk a címekhez - a törzsszöveg marad rendszerbetű. */
export const SERIF = {
  medium: 'PlayfairDisplay_500Medium',
  semibold: 'PlayfairDisplay_600SemiBold',
  bold: 'PlayfairDisplay_700Bold',
};

export type Intensity = 'soft' | 'normal' | 'deep';

export type Palette = {
  name: string;
  /** Sötét paletta esetén a szövegszínek megfordulnak. */
  dark: boolean;
  /** A háttér-átmenet három állomása, teljes erősségen. */
  stops: [string, string, string];
  accent: string;
  /** A választóban megjelenő három kis korong. */
  swatches: [string, string, string];
};

export const PALETTES: Palette[] = [
  {
    name: 'Világoskék',
    dark: false,
    stops: ['#C6DDF5', '#DCE9F7', '#EDF2F7'],
    accent: '#2C6DA8',
    swatches: ['#D9E8F7', '#8DBBE4', '#2C6DA8'],
  },
  {
    name: 'Rózsakert',
    dark: false,
    stops: ['#F8C9D9', '#FBE3DC', '#F6EFE9'],
    accent: '#C2436A',
    swatches: ['#F8DCE5', '#EC9BB6', '#C2436A'],
  },
  {
    name: 'Levendula',
    dark: false,
    stops: ['#D6CDF2', '#E4DDF6', '#F0EDF7'],
    accent: '#6A4BC4',
    swatches: ['#E2DBF5', '#A996E8', '#6A4BC4'],
  },
  {
    name: 'Barackfa',
    dark: false,
    stops: ['#FBD7B4', '#FBE6D2', '#F7EFE6'],
    accent: '#C4692B',
    swatches: ['#FBE3CC', '#F0B183', '#C4692B'],
  },
  {
    name: 'Mentaliget',
    dark: false,
    stops: ['#C3E8D2', '#DDF0E3', '#EDF4EE'],
    accent: '#2E7D57',
    swatches: ['#D8EFE1', '#8FCFAC', '#2E7D57'],
  },
  {
    name: 'Monokróm',
    dark: false,
    stops: ['#DCDCDE', '#E9E9EB', '#F4F4F5'],
    accent: '#2E2E33',
    swatches: ['#E6E6E8', '#A8A8AE', '#2E2E33'],
  },
  {
    name: 'Éjfél rózsa',
    dark: true,
    stops: ['#3A2442', '#261B31', '#191427'],
    accent: '#F0709E',
    swatches: ['#3E2C46', '#8A5F8C', '#F0709E'],
  },
  {
    name: 'Palakő',
    dark: true,
    stops: ['#2C3440', '#222932', '#191D24'],
    accent: '#5EA9D8',
    swatches: ['#333C49', '#5C6B7D', '#5EA9D8'],
  },
];

/** Az induló színvilág - ezt látja, aki először nyitja meg az appot. */
export const DEFAULT_PALETTE = 'Világoskék';

export const INTENSITIES: { key: Intensity; label: string; factor: number }[] = [
  { key: 'soft', label: 'Halvány', factor: 0.4 },
  { key: 'normal', label: 'Közepes', factor: 0.72 },
  { key: 'deep', label: 'Mély', factor: 1 },
];

function clamp(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function parseHex(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

/** Két szín keverése. `t = 0` -> `a`, `t = 1` -> `b`. */
function mixHex(a: string, b: string, t: number): string {
  const pa = parseHex(a);
  const pb = parseHex(b);
  const out = pa.map((v, i) => clamp(v + (pb[i] - v) * t));
  return '#' + out.map((v) => v.toString(16).padStart(2, '0')).join('');
}

/** A kész, komponensekben használható téma. */
export type Theme = {
  palette: Palette;
  intensity: Intensity;
  gradient: readonly [string, string, ...string[]];
  accent: string;
  accentSoft: string;
  card: string;
  label: string;
  labelSecondary: string;
  labelTertiary: string;
  separator: string;
  fill: string;
  /** Bevétel: mindig zöldes, a palettától függetlenül - ez konvenció. */
  income: string;
  /** Negatív egyenleg jelzésére. */
  negative: string;
  dark: boolean;
  radius: number;
  gap: number;
};

/**
 * Palettából + erősségből kész téma.
 *
 * Az erősség úgy működik, hogy az átmenet állomásait a "papír" felé
 * mossuk: világos palettánál fehér, sötétnél majdnem fekete felé.
 * Így egyetlen szám szabályozza a háttér mélységét, palettánként külön
 * hangolás nélkül.
 */
export function buildTheme(paletteName: string, intensity: Intensity): Theme {
  const palette =
    PALETTES.find((p) => p.name === paletteName) ??
    PALETTES.find((p) => p.name === DEFAULT_PALETTE) ??
    PALETTES[0];
  const factor = INTENSITIES.find((i) => i.key === intensity)?.factor ?? 0.72;

  const dark = palette.dark;
  const paper = dark ? '#141019' : '#FFFFFF';

  const stops = palette.stops.map((c) => mixHex(paper, c, factor));
  const gradient: readonly [string, string, ...string[]] = [
    stops[0],
    stops[1],
    stops[2],
  ];

  return {
    palette,
    intensity,
    gradient,
    accent: palette.accent,
    accentSoft: mixHex(paper, palette.accent, 0.22),
    card: dark ? 'rgba(255,255,255,0.07)' : '#FFFFFF',
    label: dark ? '#F4EEF1' : '#2E2126',
    labelSecondary: dark ? 'rgba(244,238,241,0.62)' : 'rgba(70,44,54,0.62)',
    labelTertiary: dark ? 'rgba(244,238,241,0.30)' : 'rgba(70,44,54,0.30)',
    separator: dark ? 'rgba(255,255,255,0.12)' : 'rgba(120,80,95,0.13)',
    fill: dark ? 'rgba(255,255,255,0.10)' : 'rgba(196,120,150,0.10)',
    income: dark ? '#71D6A4' : '#2E7D57',
    negative: dark ? '#FF9A8B' : '#BE3F2E',
    dark,
    radius: 22,
    gap: 16,
  };
}
