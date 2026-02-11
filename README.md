# PulseVote (Expo + React Native + TypeScript)

PulseVote is a minimal mobile app for daily reflection voting.

## Features (MVP)
- Create binary reflection questions (`A` vs `B`) with low-friction defaults:
  - Daily schedule
  - Window: `18:00` to `21:00`
  - Duration: `startDate` to `startDate + 365 days`
  - Local notification at `18:00` while active
- Home screen lists active questions with status chips:
  - Pending
  - Answered
  - Next due
- One-tap answer logging (plus optional note)
- Insights per question:
  - Total counts and percentages
  - Last 30 days counts
  - CSV export + native share sheet
- Offline-first persistence with `expo-sqlite`
- Notification-driven navigation directly into the Answer screen

## Tech
- Expo + React Native + TypeScript
- `expo-sqlite` for local storage
- `expo-notifications` for local reminders
- `expo-file-system` + `expo-sharing` for CSV export/share

## Getting started

### 1) Install dependencies
```bash
npm install
```

### 2) Run in development
```bash
npm run start
```
Then use Expo Go or simulator shortcuts from the Expo CLI.

## Dev build install on a phone (recommended for notifications)
Notifications are most reliable in a development build, especially on Android.

### Android
1. Generate dev build:
   ```bash
   npx expo run:android
   ```
2. Install on device via USB debugging or emulator.

### iOS
1. Build and run dev client:
   ```bash
   npx expo run:ios
   ```
2. Open the dev build on your iPhone (same Apple signing/team setup required).

> You can also use EAS Build for cloud dev builds if preferred.

## Notification permissions notes
- App requests notification permission on startup.
- If denied, reminders will not display until permissions are enabled in system settings.
- iOS: make sure notification authorization is enabled in Settings.
- Android 13+: POST_NOTIFICATIONS permission must be granted.

## Usage flow
1. Create a question from Home.
2. Keep defaults for quickest setup (daily 6–9pm for one year).
3. At `18:00`, local reminder appears.
4. Tap reminder to jump to Answer screen.
5. Tap A or B to log immediately.
6. View trends and export CSV from Insights.

## Project structure
- `App.tsx` - app entry, navigation, notification tap routing
- `src/db/database.ts` - SQLite schema and CRUD
- `src/services/notifications.ts` - notification scheduling/canceling
- `src/services/store.ts` - app state and startup orchestration
- `src/screens/*` - Home, Create Question, Answer, Insights
- `src/utils/schedule.ts` - due-date and pending logic
