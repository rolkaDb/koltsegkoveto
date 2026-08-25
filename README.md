# Költségvető

Magyar nyelvű kiadás- és bevétel-nyilvántartó mobilalkalmazás. Fiók nélkül
működik: minden adat a készüléken marad, és mentésfájlba exportálható.

## Adatvédelmi tájékoztató

<https://rolkadb.github.io/koltsegveto-adatvedelem/>

A dokumentum forrása külön, nyilvános repóban van
([rolkaDb/koltsegveto-adatvedelem](https://github.com/rolkaDb/koltsegveto-adatvedelem)),
mert a Google Play Console nyilvános webcímen kéri. **Itt szándékosan nincs
másolat belőle** — két példány idővel szétcsúszna.

## Technikai alapok

Expo SDK 54 · React Native 0.81 · React 19 · TypeScript · expo-router

Az adatok `AsyncStorage`-ban élnek, négy kulcs alatt: tételek, ismétlődő
szabályok, beállítások, megjelenés. Az alkalmazás **egyetlen hálózati hívást sem
tartalmaz**.

## Parancsok

Windowson a `.cmd` végződés kötelező: a PowerShell alapértelmezett
szabálya nem engedi futtatni a `.ps1` indítókat.

```
npm.cmd test            # 66 teszt a lib/ tiszta függvényeire
npm.cmd run typecheck   # tsc --noEmit
npx.cmd expo start      # fejlesztői szerver
```

Ha Claude módosít egy fájlt, a Metro Windowson nem veszi észre magától —
`r`-t kell nyomni a terminálban.

## Build

```
eas.cmd build --platform android --profile preview      # APK, megosztható linken
eas.cmd build --platform android --profile production   # .aab a Play Store-hoz
```

Az aláírókulcs az Expo-fiókban él, és **minden későbbi buildhez ugyanaz kell** —
különben az app nem frissíthető, csak új appként adható ki. A `versionCode`-ot
az EAS tartja nyilván (`appVersionSource: "remote"`), kézzel nem kell léptetni.
