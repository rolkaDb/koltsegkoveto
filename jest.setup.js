/**
 * Tesztkörnyezeti előkészítés.
 *
 * Az AsyncStorage natív modul: a telefonon van mögötte valódi tároló,
 * a tesztekben viszont nincs. A csomag ad hozzá hivatalos utánzatot,
 * ami memóriában tárol - így a `lib/storage.ts` importálható anélkül,
 * hogy a natív réteg hiánya megbuktatná a tesztet.
 */
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
