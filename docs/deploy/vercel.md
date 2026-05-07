# Vercel Deploy Path

PaperGraph is staying on Next.js. The recent runtime errors were app bugs, not evidence that the project needs Vite.

## Recommended Vercel Project Settings

- Framework preset: `Next.js`
- Root directory: repository root
- Install command: `npm install`
- Build command: `npm run build`
- Development command: `npm run dev -- --port $PORT`
- Output directory: leave as the Next.js default

Vercel should auto-detect the Next.js workspace through the root `package.json` build script.

## Preflight

Run these before every deploy:

```bash
npm run typecheck
npm run build
npm run e2e
```

If the Vercel project is linked locally, a production-env build check can use:

```bash
vercel env run -e production -- npm run build
```

## Notes

- `storage/` is ignored and only used for local mock persistence. Production needs a database adapter before user-facing persistence is expected.
- The app currently has a mock-first signal adapter. Keep the adapter boundary in `apps/web/lib/mock-store.ts` when replacing it with a database.
- Public share pages already enforce visibility redaction; keep that behavior covered in Playwright before deploying social features.
