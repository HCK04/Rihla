# Project Structure

Rihla keeps route files, reusable UI, feature code, and domain content separated so the app is easier to scan.

```text
src/
  app/                    Next.js routes, layouts, and API handlers
    (app)/                Auth-free mobile app shell routes
    api/                  Server routes for chat, scan, and itinerary generation

  components/
    navigation/           App shell navigation controls such as bottom nav and FAB
    ui/                   Reusable design-system primitives

  features/
    discover/             Discover-specific UI and future feature logic

  content/
    spots/                City spot datasets
    teams/                World Cup team dataset
    flag-codes.ts         Flag image helpers
    spot-images.ts        Spot image lookup and category fallbacks

  lib/                    Shared utilities, i18n, context, storage helpers, and types

public/
  patterns/               Static zellige pattern assets

remotion/
  scenes/                 Video demo scenes
  components/             Video-only visual components
```

## Rules of Thumb

- Keep `src/app` focused on routing and page composition.
- Put reusable controls in `src/components/ui`.
- Put shell-level navigation in `src/components/navigation`.
- Put feature-specific components in `src/features/<feature>/components`.
- Put static app domain data in `src/content`, not route folders.
- Keep Remotion files separate from the interactive app because they render video scenes, not app routes.
