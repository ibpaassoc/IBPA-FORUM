# Google Sheets Sync

Automatically mirrors platform data into a Google Spreadsheet and keeps a live
statistics tab. The integration is **optional** — when the environment variables
below are not set, every sync becomes a silent no-op and the rest of the
platform is unaffected.

## What gets synced

| Tab            | Contents                                                            |
| -------------- | ------------------------------------------------------------------- |
| `applications` | Participant applications (no reviewer/admin identities)             |
| `jury`         | Jury applications (no reviewer/admin identities)                    |
| `scores`       | Judge scores, criteria, totals and averages                        |
| `tickets`      | Ticket orders, pricing, payment and check-in state                  |
| `stats`        | Auto-computed counts, revenue (USD) and averages across the platform |

Each data tab uses the **first column as a unique ID**. Syncing upserts by that
ID, so running any sync once or many times never creates duplicate rows.

Sync runs automatically (after the response is sent, so it never slows a user
action) whenever an application, jury application, score, ticket, payment, or
check-in is created or updated. A failure in Google Sheets is always caught and
logged — it can never interrupt the underlying action.

## 1. Create a Google Cloud service account

1. Open the [Google Cloud Console](https://console.cloud.google.com/) and create
   (or select) a project.
2. Enable the **Google Sheets API** for the project
   (APIs & Services → Library → "Google Sheets API" → Enable).
3. Go to **APIs & Services → Credentials → Create credentials → Service account**.
4. Give it a name (e.g. `ibpa-sheets-sync`) and create it. No project roles are
   required — access is granted per-spreadsheet in step 3.
5. Open the new service account → **Keys → Add key → Create new key → JSON**.
   A JSON key file downloads; keep it secret (it is the credential).

The JSON file contains, among other fields:

```json
{
  "client_email": "ibpa-sheets-sync@your-project.iam.gserviceaccount.com",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
}
```

## 2. Share the spreadsheet with the service account

The service account can only see spreadsheets that are explicitly shared with it.

1. Open your spreadsheet (the one with the `applications`, `jury`, `scores`,
   `tickets` tabs — a `stats` tab is created automatically if missing).
2. Click **Share** and add the service account's `client_email` as an **Editor**.
3. Copy the spreadsheet ID from its URL:
   `https://docs.google.com/spreadsheets/d/`**`<SPREADSHEET_ID>`**`/edit`.

## 3. Configure environment variables

Set these three variables (locally in `.env`, and in your Vercel project
settings for production). Credentials are read **server-side only** and are
never sent to the browser.

| Variable                          | Value                                              |
| --------------------------------- | -------------------------------------------------- |
| `GOOGLE_SHEETS_CLIENT_EMAIL`      | The service account `client_email`                 |
| `GOOGLE_SHEETS_PRIVATE_KEY`       | The service account `private_key` (multiline PEM)  |
| `GOOGLE_SHEETS_SPREADSHEET_ID`    | The spreadsheet ID from step 2                      |

### Handling the multiline private key

The private key is a multiline PEM. Two formats are accepted automatically:

- **Escaped newlines (recommended for `.env` / Vercel):** put the whole key on
  one line with literal `\n` between segments, optionally wrapped in quotes:

  ```dotenv
  GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n"
  ```

- **Real newlines:** a genuine multiline value also works.

The loader strips surrounding quotes and converts `\n` into real newlines before
signing, so you can paste the key directly from the JSON file.

> On Vercel, paste the value exactly as it appears in the JSON file (with the
> `\n` sequences). The integration normalizes it at runtime.

## 4. Backfill existing data

Once configured, sign in to the admin area and open **Admin → Google Sheets**.
Use **Sync All Data to Google Sheets** to upsert every existing record and
refresh statistics. The buttons there also let you sync a single domain or
refresh statistics on demand. Running them repeatedly is safe and idempotent.

## Security notes

- All Google Sheets code lives in `features/google-sheets` and is `server-only`;
  credentials never reach the client bundle.
- The `applications` and `jury` tabs deliberately **omit** reviewer/admin
  identities (name, email, internal IDs).
- `credentials.json` is git-ignored as a safety net, but credentials should be
  provided through environment variables, not a checked-in file.
