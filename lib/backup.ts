import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { dayKey } from './format';
import {
  normalizeAppearance,
  normalizeEntries,
  normalizeRecurring,
  normalizeSettings,
  type Appearance,
  type Settings,
} from './storage';
import type { Entry, Recurring } from './types';

/**
 * A mentésfájl tartalma.
 *
 * Az `app` és a `version` mező szándékos: ebből tudjuk visszatöltéskor,
 * hogy tényleg a mi fájlunkat kaptuk-e, és hogy melyik formátumban.
 * Ha egyszer változik a szerkezet, a `version` alapján lehet majd
 * átalakítani a régi mentéseket ahelyett, hogy elutasítanánk őket.
 */
export type Backup = {
  app: 'koltsegkoveto';
  version: 1;
  exportedAt: string;
  entries: Entry[];
  recurring: Recurring[];
  settings: Settings;
  appearance: Appearance;
};

export type BackupData = Omit<Backup, 'app' | 'version' | 'exportedAt'>;

export class BackupError extends Error {}

/**
 * Mentés készítése: fájlba írjuk, majd megnyitjuk a rendszer megosztóját,
 * ahol a felhasználó eldöntheti, hova kerüljön (Fájlok, e-mail, felhő).
 *
 * A gyorsítótár-könyvtárat használjuk, mert a fájl csak addig kell,
 * amíg a megosztás tart - onnantól a cél alkalmazásé.
 *
 * @returns a fájl neve, vagy `null`, ha a megosztás nem elérhető
 */
export async function exportBackup(data: BackupData): Promise<string | null> {
  const backup: Backup = {
    app: 'koltsegkoveto',
    version: 1,
    exportedAt: new Date().toISOString(),
    ...data,
  };

  const name = `penztarca-mentes-${dayKey(new Date())}.json`;
  const file = new File(Paths.cache, name);

  if (file.exists) file.delete();
  file.create();
  file.write(JSON.stringify(backup, null, 2));

  if (!(await Sharing.isAvailableAsync())) return null;

  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/json',
    UTI: 'public.json',
    dialogTitle: 'Pénztárca mentés',
  });

  return name;
}

/**
 * Visszaállítás: a felhasználó kiválaszt egy fájlt, mi pedig ellenőrizzük
 * és megtisztítjuk a tartalmát.
 *
 * Szándékosan `*​/*` típusszűrővel kérünk fájlt: a JSON-szűrő iOS-en
 * néha semmit nem enged kijelölni. Inkább engedünk mindent, és a
 * tartalom alapján utasítunk vissza, érthető üzenettel.
 *
 * @returns a betöltött adat, vagy `null`, ha a felhasználó megszakította
 */
export async function importBackup(): Promise<BackupData | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: '*/*',
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets?.length) return null;

  const file = new File(result.assets[0].uri);

  let parsed: unknown;
  try {
    parsed = JSON.parse(await file.text());
  } catch {
    throw new BackupError('A fájl nem olvasható. Biztosan mentésfájlt választottál?');
  }

  const raw = parsed as Record<string, unknown> | null;
  if (!raw || raw.app !== 'koltsegkoveto') {
    throw new BackupError('Ez nem a Pénztárca mentésfájlja.');
  }

  const entries = normalizeEntries(raw.entries);
  if (entries.length === 0 && !Array.isArray(raw.entries)) {
    throw new BackupError('A mentésfájl sérült: nincs benne értelmezhető tétel.');
  }

  return {
    entries,
    recurring: normalizeRecurring(raw.recurring),
    settings: normalizeSettings(raw.settings),
    appearance: normalizeAppearance(raw.appearance),
  };
}
