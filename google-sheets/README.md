# Connect the GitHub Pages invitation to Google Sheets

You need one Google account and a private Google Sheet. No paid backend host,
API key, Microsoft account, or public sharing of the spreadsheet is required.
The website keeps its current maroon design.

## Actions for the spreadsheet owner

1. Open **https://sheets.new** and name the spreadsheet **Sagar & Ishwari — Wedding Responses**.
2. In that spreadsheet, select **Extensions → Apps Script**. Replace the sample
   `myFunction` code with the entire contents of [`Code.gs`](Code.gs). Save the
   project, for example as **Wedding Responses**.
3. Select **setup** from the function dropdown beside Run, then click **Run**.
   Review the Google permission prompt and authorize your own script using the
   account that owns the sheet. If Google displays an unverified-app notice,
   first confirm that it is the project you just created; this code is running
   in your account, not a third-party hosted service.

   The script automatically creates **RSVPs** and **Messages** tabs, styles their
   headers, hides technical ID/hash columns, and sets sheet timestamps to India
   time. You do not need to enter a spreadsheet ID in the code. Setup preserves
   existing response rows if you run it again.

4. In Apps Script, select **Deploy → New deployment**. Click the gear beside
   Select type, choose **Web app**, and set:

   | Setting | Value |
   | --- | --- |
   | Execute as | **Me** — the spreadsheet owner |
   | Who has access | **Anyone** |

   Click **Deploy** and complete any remaining Google authorization steps.
   Guests need anonymous access to the receiving web app; the spreadsheet itself
   stays private. Do **not** publish the spreadsheet or enable public link sharing.

5. Copy the **Web app URL**, which looks like:

   ```text
   https://script.google.com/macros/s/DEPLOYMENT_ID/exec
   ```

   Open it in an incognito/private browser window. It should show JSON with
   `"ok":true` and `"ready":true`, without asking you to sign in. A URL ending in
   `/dev` is a test URL and cannot be used by wedding guests.

6. **Send the `/exec` web app URL back in this chat.** The URL is public receiver
   configuration, not a Google password or API secret. No account credentials or
   private spreadsheet link are needed. Once it is provided, the frontend can be
   connected, built, published to the existing GitHub Pages site, and checked
   against your actual sheet.

If the **Anyone** option is unavailable, your Google Workspace organization may
restrict anonymous web apps. Use a personal Google account or ask the Workspace
administrator about that setting; making the spreadsheet public does not fix it.

## View responses and download Excel

Open the private spreadsheet to see new rows. RSVPs include names, optional email addresses,
attendance, guest counts and dietary requests. Messages include the guest's name
and wish. Only the spreadsheet's existing authorized editors can read these rows.

For an Excel workbook choose **File → Download → Microsoft Excel (.xlsx)**.
Both tabs are included. Share the sheet only with the family members who should
see private guest information. Keep its header row and hidden technical columns
intact; do not reorder or delete those columns.

## Frontend connection and publication

The integration code uses **VITE_GOOGLE_SHEETS_URL**. The provided public
deployment URL is now saved in `.env.production`, so production builds reproduce
the connected invitation. For a local override, use an ignored `.env.local` file
at the repository root:

```dotenv
VITE_GOOGLE_SHEETS_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

Then build the static invitation:

```sh
npm ci
npm test
npm run test:sheets
npm run build
```

Publish the contents of `dist/` to the existing `gh-pages` branch, including an
empty `.nojekyll` file. GitHub Pages can continue using **Deploy from a branch →
gh-pages → / (root)**. This integration does not require a separate Node server.
The Apps Script URL is bundled into the site and is intentionally public.

Before inviting guests, test one RSVP and one message from the public website in
an incognito window. Confirm that both rows actually appear in your Google Sheet,
then remove those test rows. Also edit the RSVP and check that its existing row
updates instead of creating a duplicate.

**Local simulations do not authenticate to your Google account or prove a live
write to your sheet. The deployment URL is configured, but live verification must
still confirm a real RSVP and message.**
Until a valid deployment URL is configured, the site clearly says online replies
are not open and disables submission buttons instead of claiming to save locally.

## How receipt confirmation and privacy work

- Forms POST JSON using the CORS-safelisted `text/plain` content type, avoiding
  an unsupported Apps Script OPTIONS request. The browser follows Google's
  ContentService redirect and checks its JSON receipt.
- A submission is successful only after the script confirms its sheet write.
  HTTP-200 error responses, sign-in pages, timeouts, and invalid receipts remain
  errors. Do not change the request to `mode: 'no-cors'`: opaque responses cannot
  prove that a row was saved.
- A script lock serializes overlapping submissions. Stable submission IDs avoid
  duplicate rows during retries, and a per-browser editing key protects RSVP
  updates. Only the key's hash is stored in the spreadsheet.
- Inputs have length/type checks and a honeypot field. Spreadsheet-like formulas
  are escaped before being saved. Google Apps Script's normal usage quotas apply.
- The public script has no endpoint for listing guest details or wishes. Wish
  cards show only the current browser's confirmed sent wishes, not all guests'
  private messages. Earlier browser-only or Excel-server receipts are not treated
  as Google Sheets receipts.
- No automatic email, WhatsApp, or other notifications are sent.

For a later script update, use **Deploy → Manage deployments → Edit → New
version → Deploy** to retain the same `/exec` URL. A brand-new deployment has a
new ID and must be connected in the frontend again.

## Local validation

```sh
npm test
npm run test:sheets
npm run build
```

The Apps Script tests use local test doubles for Google services, exercising the
actual `Code.gs` source. They cover setup, private storage, updates, retries,
formula escaping, validation, write failures and lock contention. Browser checks
exercise cross-origin submission and redirects with a local receiver simulation.
A real Google deployment must still pass the public-site smoke test above.

## Update an existing deployment for optional email

The website no longer requires an RSVP email address. To accept blank emails,
replace the existing Apps Script code with the current `Code.gs`, save, then use
**Deploy → Manage deployments → Edit (pencil) → Version: New version → Deploy**.
Keep the existing deployment and `/exec` URL. Existing response rows are preserved,
and there is no need to rerun `setup` for this change. Nonempty email addresses
are still checked for a valid format. Until this Google-side update is deployed,
the older script will continue to reject blank email addresses.
