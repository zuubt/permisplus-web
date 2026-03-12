# PermisPlus Web

Mobile-first Next.js prototype for the PermisPlus driving learning experience.

## Current Direction

This prototype implements the V3 product direction:
- quiz-first learning flow
- mature Todoist-inspired visual system
- strict onboarding order
- Learn, Rewards, Progress, and Profile navigation
- local-first demo state with autoplay quiz audio

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
```

## Notes

- onboarding currently uses a demo OTP code: `1234`
- state is stored in `localStorage`
- quiz image areas currently use explicit placeholders until real photo assets are provided
- the Supabase schema still needs a dedicated V3 data-model pass if backend sync is resumed
