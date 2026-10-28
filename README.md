# Sagar & Ishwari — wedding invitation

A mobile-first React + TypeScript invitation, built with Vite, Tailwind CSS v4, Framer Motion, and Lucide React.

## Develop

```sh
npm ci --cache /tmp/wedding-npm-cache
npm run dev -- --port 5173
```

## Validate and build

```sh
npm test
npm run build
npm run preview -- --port 4173
```

Deploy the contents of `dist/` to a static host. Relative Vite asset paths support GitHub Pages. This repository does not automatically publish on push; configure your hosting build to run `npm ci && npm run build` and serve `dist/`.

## Personalize

All wedding information and asset references live in `src/data/weddingData.ts`. On January 15, 2027: engagement is 7–9 AM, Ganesh Sthapna and Mandap Murat are 9 AM–12 PM, Haldi begins at 3 PM, and Sangeet is at 7 PM. The wedding is January 16 at 10 AM. All times are India time (IST). Unspecified logistics remain visibly pending rather than invented.

- Set `templeArtwork` to a transparent image URL or a file in `public/`. The hero uses `public/temple.png`, a transparent temple asset prepared from the supplied screenshot. The original local SVG remains available as a fallback. Both image halves use the same source, clipped at the exact center; their scroll transforms open a glowing portal with no scroll locking or artificial runway. Reduced-motion preferences keep the artwork static.
- Replace `photos` with personal image paths and meaningful alternative text. Without photos, the carousel displays clearly labeled illustrated placeholders.
- Set `youtubeId` to the YouTube video ID (not the full URL); the embed loads only after play is selected.
- Set `musicUrl` to a licensed audio file. The music control appears only when configured, and playback requires user interaction.
- Add real venue, map URL, contact information, and family names when known. The default hashtag is editable.
- RSVP and wishes are **local to the visitor’s browser**. They do not send messages, notify the families, or sync between devices. The interface states this before and after saving. A shared RSVP or wishes wall requires a backend or form service. Do not add secret API keys to this frontend.
- `index.html` contains SEO metadata. Before public launch, set an absolute production `og:image` URL for broad social crawler support. A 1200×630 PNG is included as `public/social-card.png`; `public/social-card.svg` is its editable source design. Set your canonical URL when the final domain is known.

Fonts load from Google Fonts, with local serif and sans-serif fallbacks. Other default visuals are local SVG assets; no third-party stock photography is used. An archived original portfolio page remains at `gemini-code-1782063047351.html`.
