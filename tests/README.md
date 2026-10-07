# Release 1 checks

Use Node.js 22.18+ or 24 and `npm ci`. `npm test` checks the existing workflow URL contracts. `npm run test:browser` exercises the real JobCore pages with 130 disposable jobs, fixture authentication and evidence images, in Chromium and WebKit at desktop and phone sizes.

The browser suite refuses non-loopback application/fixture URLs. No real Supabase project, keys or user accounts are used. The fixture server implements only the small database/auth subset required here; it does **not** verify production RLS, office permissions or profile identity. Items 5 and 6 remain gated and have no implementation in this branch.

Install browser engines once with `npx playwright install chromium webkit` (or set `PLAYWRIGHT_BROWSERS_PATH` to an existing installation).

Start fixture data in one terminal:

```sh
node tests/fixtures/supabase.mjs
```

Build and start the app in another terminal using **only** these local fixture settings:

```sh
export NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:3101
export NEXT_PUBLIC_SUPABASE_ANON_KEY=fixture-only
export SUPABASE_SERVICE_ROLE_KEY=fixture-only
export OPENAI_API_KEY=fixture-only
npm run build
npm run start -- --hostname 127.0.0.1 --port 3103
```

Run the tests in a third terminal:

```sh
TEST_APP_URL=http://127.0.0.1:3103 npm run test:browser
```

For development-mode checks, the same settings can run `npm run dev -- --hostname 127.0.0.1 --port 3100`. Tests default to port 3100. `TEST_BROWSER=chromium` or `TEST_BROWSER=webkit` runs a single engine; the default runs both. Screenshots go to `../release1-screenshots`, or `TEST_SCREENSHOT_DIR` if supplied. The fake login is `preview@example.com` / `fixture-only`; all fixture mutations live only in the local server's memory and reset between browser runs.

The device theme, readable inputs/selects, grouped menu, keyboard/tap operation, workflow headings, dashboard URL parity, zero-result queues, sticky positioning, exact bulk-assignment payload and resulting fixture rows, photo order/boundaries, selection mode, failed-image navigation, Escape, modal focus and fitter routing are checked. Windows and physical iPhone/Safari remain manual checks; WebKit is Safari-engine coverage, not a physical-device test.
