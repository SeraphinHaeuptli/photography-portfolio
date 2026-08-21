# Photography Portfolio — Master Build Prompt

Drop this file in the repo root (e.g. `MASTERPLAN.md`). In Codespaces, open Copilot Chat and say
"Implement Task 1 from MASTERPLAN.md" — then repeat for each task in order. Do not ask Copilot to
do multiple tasks in one pass.

## Ground rules (apply to every task below)

- Implement **one task at a time**, in order. Do not start the next until the current one is verified.
- Minimum code that satisfies the task. No extra features, no speculative config, no framework
  beyond what's listed.
- Don't touch files outside the current task's scope.
- If a requirement is ambiguous, stop and ask — don't guess and build the wrong thing.
- After each task, state what was verified before moving on.

## Stack (assumptions — change this section if you want something different, everything below assumes it)

- Frontend: plain HTML/CSS/JS, no framework
- Backend (from Task 4 on): Node.js + Express
- Image storage: local `public/images/` + a `gallery.json` manifest — no database, no cloud storage
- Auth: bcrypt password hash + TOTP 2FA (`speakeasy` + `qrcode`) + `express-rate-limit`
- Donations: a Stripe **Payment Link** (hosted by Stripe) — no custom checkout backend
- Runtime: Node 20+, GitHub Codespaces devcontainer

## Target repo structure

```
/
├── public/
│   ├── index.html
│   ├── styles.css
│   ├── gallery.js
│   ├── config.js
│   ├── images/
│   └── gallery.json
├── admin/
│   ├── login.html
│   ├── index.html
│   ├── admin.js
│   └── admin.css
├── server/
│   ├── server.js
│   ├── auth.js
│   └── routes/
├── .env.example
├── package.json
└── README.md
```

---

## Task 1 — Static gallery scaffold (do first)

**Goal:** Public page showing photos in a responsive grid, read from a static JSON manifest. No
backend yet.

Steps:
- `public/index.html`, `public/styles.css`, `public/gallery.js`
- `public/gallery.json` with 3–5 placeholder entries: `{ id, filename, title, alt }`
- `gallery.js` fetches `gallery.json`, renders a CSS grid of thumbnails from `public/images/`
- Responsive grid (`grid-template-columns: repeat(auto-fill, minmax(...))`), `loading="lazy"` on images

**Verify:** Serve `public/` (any static server) → grid renders, resizes responsively, no console errors.

**Do not:** add the lightbox, admin, auth, or donate button yet.

---

## Task 2 — Apple-style zoom lightbox

**Goal:** Click a thumbnail → it smoothly expands into a large centered overlay. An X button
top-right closes it, and it shrinks back to its original position.

Approach: FLIP technique. On click, read the thumbnail's `getBoundingClientRect()`, position an
overlay image at that exact rect, force a reflow, then transition `transform`/size to the
enlarged/centered state. Reverse the same transition on close.

Steps:
- Overlay container + dimmed backdrop (fades in)
- Click handler: capture rect → animate clone/overlay from that rect to large/centered
- Close = X button (top-right of the enlarged image), Escape key, and backdrop click
- CSS transition on `transform`/`opacity`, ~300–350ms, `cubic-bezier(0.4, 0, 0.2, 1)`
- Close reverses the animation back to the source thumbnail's rect, then removes the overlay

**Verify:** Click any image → smooth scale/position animation, no flash/jump. X, Escape, and
backdrop click all close it with the same animation in reverse. Test in Chrome and Safari.

**Do not:** add next/prev navigation, swipe gestures, or captions unless asked.

---

## Task 3 — Stripe donate button

**Goal:** A "Donate" button on the public page that opens a Stripe-hosted payment page.

Steps:
- Create a Stripe **Payment Link** in the Stripe Dashboard (manual, one-time — not code)
- Add `public/config.js` exporting the Payment Link URL as a constant
- Add a styled donate button/link in `index.html` using that URL, `target="_blank"`

**Verify:** Clicking Donate opens the Stripe payment page in a new tab.

**Do not:** build a custom Checkout session, backend, or webhook handling — not needed for a
simple donate button.

---

## Task 4 — Backend + admin page (no auth yet)

**Goal:** A working admin page that adds/removes gallery images via an Express API. Get the CRUD
working first — auth is layered on in Task 5.

Steps:
- `npm init`, install `express`, `multer`, `dotenv`
- `server/server.js`: serves `public/` statically, plus:
  - `GET /api/gallery` → returns `gallery.json`
  - `POST /api/gallery` (multipart: image file + title/alt) → saves file to `public/images/`,
    appends entry to `gallery.json`
  - `DELETE /api/gallery/:id` → removes file + entry
- `admin/index.html` + `admin.js`: upload form (file, title, alt text) + list of existing images
  with a delete button each
- Validate file type (jpg/png/webp only) and max size (e.g. 10MB)

**Verify:** Run the server in Codespaces, open `/admin`, upload an image → shows up in
`gallery.json`, `public/images/`, and the public gallery. Delete → removed from both.

**Do not:** add login, sessions, or 2FA in this task.

---

## Task 5 — Admin auth: password + TOTP 2FA + brute-force protection (do last)

**Goal:** Lock `/admin` and the write endpoints behind password + TOTP 2FA, with rate limiting so
repeated failed logins get blocked.

Steps:
- Install `bcrypt`, `speakeasy`, `qrcode`, `express-session`, `express-rate-limit`
- `.env`: `ADMIN_PASSWORD_HASH` (bcrypt hash, generate once via a small one-off script),
  `ADMIN_TOTP_SECRET` (generate once, show as a QR code once to enroll in an authenticator app),
  `SESSION_SECRET`
- `POST /api/login`: check password with `bcrypt.compare` → on success, require a TOTP code
  (`speakeasy.totp.verify`) → issue session on success
- `express-rate-limit` on `/api/login`: e.g. 5 attempts / 15 min per IP, then `429`
- Middleware protecting `/admin/*` and all write endpoints (`POST`/`DELETE /api/gallery`):
  require a valid session
- `admin/login.html`: two-step form — password, then TOTP code

**Verify:**
- Wrong password or wrong TOTP code → rejected, no access
- Correct password + correct TOTP code → logged in, can use upload/delete
- 6th rapid failed attempt in the window → `429`, confirming rate limiting works
- Hitting `POST`/`DELETE /api/gallery` without a valid session → `401`/`403`

**Do not:** add user registration, multiple accounts, or password-reset flows — single hardcoded
admin identity is in scope, nothing more.
