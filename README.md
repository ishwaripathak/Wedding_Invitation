# Sagar & Ishwari — wedding invitation

A mobile-first React + TypeScript invitation, built with Vite, Tailwind CSS v4, Framer Motion, and Lucide React, with Google Apps Script for collecting private RSVPs and messages in Google Sheets.

Connect your private spreadsheet using [the Google Sheets setup guide](google-sheets/README.md). No separate backend hosting is required.

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
npm run test:sheets
```

Deploy the contents of `dist/` to a static host. Relative Vite asset paths support GitHub Pages. The existing site publishes the static `gh-pages` branch. Set `VITE_GOOGLE_SHEETS_URL` before building, then publish `dist/` there. Source pushes alone do not rebuild the published site.

## Personalize

All wedding information and asset references live in `src/data/weddingData.ts`. On January 15, 2027: engagement is 7–9 AM, Ganesh Sthapna and Mandap Murat are 9 AM–12 PM, Haldi begins at 3 PM, and Sangeet is at 7 PM. The wedding is January 16 at 10 AM. All times are India time (IST). Unspecified logistics remain visibly pending rather than invented.

- Set `templeArtwork` to a transparent image URL or a file in `public/`. The hero uses `public/temple.png`, a transparent temple asset prepared from the supplied screenshot. The original local SVG remains available as a fallback. Both image halves use the same source, clipped at the exact center; their scroll transforms open a glowing portal with no scroll locking or artificial runway. Reduced-motion preferences keep the artwork static.
- Replace `photos` with personal image paths and meaningful alternative text. Without photos, the carousel displays clearly labeled illustrated placeholders.
- Set `youtubeId` to the YouTube video ID (not the full URL); the embed loads only after play is selected.
- Set `musicUrl` to a licensed audio file. The music control appears only when configured, and playback requires user interaction.
- Add real venue, map URL, contact information, and family names when known. The default hashtag is editable.
- RSVP responses and messages are sent to your private Google Sheet through `google-sheets/Code.gs`. Follow [the setup guide](google-sheets/README.md), then set `VITE_GOOGLE_SHEETS_URL` to the deployed `/exec` URL before building. Guests see success only after the script confirms saving. The form stays unavailable until configured. Download both tabs as Excel using Google Sheets’ **File → Download → Microsoft Excel (.xlsx)**. Wish cards show only the current browser’s sent messages; guest data is not public. No automatic notifications are sent.
- `index.html` contains SEO metadata. Before public launch, set an absolute production `og:image` URL for broad social crawler support. A 1200×630 PNG is included as `public/social-card.png`; `public/social-card.svg` is its editable source design. Set your canonical URL when the final domain is known.

Fonts load from Google Fonts, with local serif and sans-serif fallbacks. Other default visuals are local SVG assets; no third-party stock photography is used. An archived original portfolio page remains at `gemini-code-1782063047351.html`.
