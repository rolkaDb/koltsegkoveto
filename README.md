# Költségvető

A Hungarian-language expense and income tracker for mobile. It works without an
account: all data stays on the device, and the whole dataset can be exported to
a single file.

Expo SDK 54 · React Native 0.81 · React 19 · TypeScript · expo-router

## What it does

- Income and expense entries, with categories
- Monthly balance and a per-category breakdown with charts
- A monthly budget
- Recurring entries (rent, subscriptions) generated automatically
- Several currencies
- Export and restore through a single JSON file

## The design decision behind it

**The app makes no network calls at all.** Not one. There is no account, no
analytics, no advertising. Data lives in `AsyncStorage` under four keys: entries,
recurring rules, settings and appearance.

This is not a feature written on a list, it is the architecture. Because of it,
every answer on Google Play's data safety form is "no data collected". There is
nothing to declare, because there is nothing to collect. I did not write a
privacy policy and then build around it; I chose a structure with nothing to
confess.

The trade-off is real and worth naming: no cloud sync, no multi-device access.
The export file is what replaces them.

## Recurring entries

Rent and subscriptions create themselves every month, and the generation is
**idempotent**: however many times it runs, an entry is only created once. An
entry scheduled for the 31st falls back to the last day of the month in
February. Entries are created at midday to avoid time-zone drift.

## Privacy policy

<https://rolkadb.github.io/koltsegveto-adatvedelem/>

The source lives in its own public repository
([rolkaDb/koltsegveto-adatvedelem](https://github.com/rolkaDb/koltsegveto-adatvedelem)),
because the Google Play Console requires a public web address. There is
deliberately **no copy of it here**, because two copies would drift apart.

## Running it

```bash
npm install
npx expo start
```

```bash
npm test            # 66 tests over the pure functions in lib/
npm run typecheck   # tsc --noEmit
```

## Build

```bash
eas build --platform android --profile preview      # APK, shareable by link
eas build --platform android --profile production   # .aab for the Play Store
```

The signing key lives in the Expo account and **every later build needs the same
one**, otherwise the app cannot be updated, only published as a new app. EAS
keeps track of `versionCode` (`appVersionSource: "remote"`), so it does not need
to be bumped by hand.

## Status

Prepared for release: signed Android builds, store copy and imagery, data safety
declaration and a hosted privacy policy are all done. Not published to the Play
Store.

## Known limitation

Exchange rates are stored per currency, not per entry. If you change the rate of
a currency, it applies retroactively to every past entry. The fix is to store
the rate alongside each entry at the time it is recorded. Not done yet.

---

*A magyar nyelvű változat: [README.hu.md](README.hu.md)*
