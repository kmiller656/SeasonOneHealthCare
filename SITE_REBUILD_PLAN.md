# seasononehealthcare.com — rebuild as the app's marketing site

**Written 2026-08-08 (Opus 5) for a Sonnet 5 executor.** House shape: verified findings →
decisions → contracts → ordered work packages with a gate each → executor prompt.

**Goal (Kenneth, 2026-08-08):** scrap the current site and restart with a single purpose —
marketing the PANCE prep app. Screenshots of the app, its features and intent, a
"coming soon" store announcement, ways to connect / work together, and a signup form.
Everything else goes.

App-side work (haptics, community submissions) is a **separate plan in the app repo** —
`PANCEPrep/COMMUNITY_AND_HAPTICS_PLAN.md`.

---

## 0. Verified findings — checked 2026-08-08. Do NOT re-derive.

| Finding | Detail |
|---|---|
| **This folder IS a git repo** | `Website Code/` → remote `https://github.com/kmiller656/SeasonOneHealthCare.git`, branch `main`, working tree clean, latest commit `48c77fa`. *(An older project note called this a non-git working copy — that is out of date.)* **Everything is recoverable from git history, so "scrapping" the old site destroys nothing permanently.** |
| **Deploy path** | Cloudflare Pages, from that GitHub repo. `CNAME` → `seasononehealthcare.com`. Push to `main` deploys. |
| **Current identity is behavioral health** | `<title>Season One Healthcare — A trusted home for behavioral health</title>`; H1 "A trusted home for health, wellness, and the people who make it happen." This is the July 2026 pivot away from PA staffing. **Rebuilding supersedes that work** — see D3. |
| **Forms already work — reuse, don't rebuild** | `assets/site.js` posts `FormData` to `https://api.web3forms.com/submit` with a hidden `access_key` field per form, showing `.form-success` / `.form-error`. **The signup form needs no new backend.** |
| **Supabase is also wired** | `assets/site.js` creates a client against project `gvqfktkkqscgmxlahyyh` with a public anon key (normal and safe — protected by RLS). Used by the directory/admin pages. If those pages go, this client and `admin.html` become orphaned — see WP2. |
| **Existing pages** | `index, about, admin, contact-us, for-recruiters, good-news, good-news-story, jobs, list-practice, partner, privacy, provider, providers, resources, share-a-story, terms, unsubscribe` + `assets/site.css`, `assets/site.js`, favicons, `logo.png`, `logo-nav.png`. |
| **Security headers already configured** | `_headers` sets HSTS, `X-Frame-Options: DENY`, nosniff, referrer policy, permissions policy, COOP. **Keep this file as-is.** |
| **Archive precedent exists** | Sibling folders `Website Code (PA Archive)` and `Website Code (Deferred Features)` — Kenneth's established pattern is archive, not delete. |
| **⚠️ There is no Android app** | The app is native SwiftUI, `TARGETED_DEVICE_FAMILY = 1` (iPhone only, release-plan D1). No Android codebase exists and none is planned. See D1. |
| **⚠️ App Store timing is genuinely unknown** | Apple Developer Program enrollment had not been started as of 2026-08-02, and it gates TestFlight as well as release. **Do not put a launch date on the site.** |
| **App store name is deliberately not "PANCE"** | Release-plan D4: store name **"Season One — PA Exam Prep"**, with PANCE only in keywords/description, specifically to avoid an NCCPA trademark-documentation request. The site should mirror that caution — see §2. |

---

## 1. Decisions

**D1 is LOCKED by Kenneth 2026-08-08: iOS only.** The site says **"Coming soon to the App
Store"** and makes **no Android claim of any kind** — not "coming soon," not "under
consideration." Do not add one back.

D2–D4 below are recommendations; confirm with Kenneth before WP4 if he hasn't weighed in.

### D1 — The "coming soon to Android" claim — **DECIDED: iOS only.**
Kenneth asked for "coming soon to the app and android store." **There is no Android app and
no development path to one** — it's a native SwiftUI iOS codebase; Android would be a
ground-up rewrite, not a port. Options:

1. **iOS only** — "Coming soon to the App Store." Honest, and matches what exists. *(Recommended.)*
2. **iOS now, Android hedged** — "Coming soon to the App Store. Android under consideration."
   Honest about intent without promising a date or a commitment.
3. **Claim both** — advertises a product that does not exist, and collects Android signups
   that cannot be served for a very long time, if ever.

This matters beyond accuracy: a signup list full of Android users you can't email a launch
link to is a list you have to disappoint later.

### D2 — Site scope. **Recommend: single marketing page + the legal pages.**
`index.html` (hero → features → screenshots → coming soon + signup → connect/partner →
footer), plus `privacy.html`, `terms.html`, `unsubscribe.html` retained and updated. Four
files. Everything else archived. A single scrolling page is the right shape for a
pre-launch app site and is far less to maintain than the current 17.

### D3 — Confirm the behavioral-health site is really being retired.
`seasononehealthcare.com` currently presents **the company** (behavioral health / community,
per the July 2026 pivot). Rebuilding it as the app's marketing site means the company site
*becomes* the app site. Kenneth said "everything else on the website can be gone," so this
reads as decided — flagging only because that pivot was recent work and the alternative
(app gets its own page or subdomain, company site stays) is a one-line change of plan now
versus a rebuild later.

### D4 — What does "ways of connecting or working together" mean concretely?
Candidates, pick any: general contact form · partnership/collab inquiries (PA programs,
faculty, content reviewers) · **clinician reviewers** (directly useful — release-plan D6
needs licensed reviewers, and the site could recruit them) · social links · press.
**Recommend: one combined contact form with a "reason for reaching out" dropdown**, since
that reuses the single Web3Forms handler rather than adding several.

---

## 2. Copy constraints — non-negotiable, these are Kenneth's own standing rules

Marketing copy is exactly where these get violated by accident. Every line of site copy
must satisfy all of the following:

- **NCCPA independence disclaimer must appear** (footer at minimum):
  *"Not affiliated with or endorsed by NCCPA. PANCE® and EOR™ are trademarks of their
  respective owners."*
- **No pass-rate or outcome promises.** No "pass the PANCE faster," no "boost your score,"
  no "students who use us pass more." There is no data behind any such claim and it is the
  category of statement most likely to cause a real problem.
- **No comparative or disparaging claims** about UWorld, Rosh, Blueprint, PPP, or anyone else.
- **Do not claim the content is clinician-reviewed or verified.** It is not yet — the entire
  corpus is Claude-authored and awaiting the release-plan D6 review pass. "Written to the
  PAEA/NCCPA blueprints" is accurate; "verified by clinicians" is not.
- **Position as an independent, additional study resource** — the framing used everywhere
  else in this project.
- **Be careful with "PANCE" prominence** (D4 above). Using it descriptively in body copy is
  normal and fine; building the brand name around it is what the store listing deliberately
  avoids.

---

## 3. Work packages

### WP1 — Archive before touching anything
1. Confirm the tree is clean, then tag the current state so it is trivially recoverable:
   `git tag pre-app-rebuild && git push origin pre-app-rebuild`.
2. Copy the current folder to a sibling `Website Code (Behavioral Health Archive)`,
   matching the existing archive-folder convention.

**Gate:** tag exists on the remote; archive folder present; `git status` still clean.

### WP2 — Strip to the skeleton
Delete from the working tree (recoverable via the WP1 tag): `about, admin, contact-us,
for-recruiters, good-news, good-news-story, jobs, list-practice, partner, provider,
providers, resources, share-a-story`.

**Keep:** `index.html` (to be rewritten), `privacy.html`, `terms.html`, `unsubscribe.html`,
`_headers`, `CNAME`, favicons, `logo.png`, `logo-nav.png`, `assets/`.

In `assets/site.js`, **remove the Supabase client and directory helpers** (orphaned once the
directory pages are gone) but **keep the Web3Forms submit handler** — the signup and contact
forms depend on it.

**Gate:** site builds/serves locally with no console errors; no dead links from the four
remaining pages; no requests to Supabase remain in the network tab.

### WP3 — App screenshots
Capture from the iPhone 16 simulator, then present them in device frames (CSS frame or a
plain rounded-corner treatment — no external image CDN; `_headers`/CSP-friendly, local files only).

**Timing matters:** the app UI is actively changing (condition-page redesign, Home redesign,
reference cards all landed in the last two sessions). **Take screenshots only after the
current UI round has settled**, or they'll be stale on arrival.

Suggested set (4–6): Home · a condition monograph (the new collapsible sections) · the
practice builder · a question in tutor mode with feedback · the Library. Prefer screens
that show *structure* over ones dominated by specific clinical claims, given §2's
"don't claim it's verified" constraint.

Save under `assets/screens/`, web-optimized (WebP or compressed PNG), with real `width`/`height`
attributes so the page doesn't reflow on load.

**Gate:** images load, are sharp on a 2× display, total page weight stays reasonable
(< ~1.5 MB), and the page passes a mobile viewport check.

### WP4 — Rewrite `index.html`
Sections in order: **hero** (what the app is, one sentence) → **features** (the honest ones:
2,781 board-style questions across 927 conditions; 1,002-condition reference library written
to the PAEA EOR blueprints; rotation-filtered practice; spaced repetition; tutor and exam
modes; works fully offline) → **screenshots** → **coming soon + signup** → **connect /
work together** → **footer with the §2 disclaimer**.

Reuse `assets/site.css`'s existing design language rather than inventing a new one.

**Gate:** every §2 constraint satisfied — re-read the copy against that list explicitly
before calling this done. Renders correctly at 375 px, 768 px, and desktop widths. Light
and dark if the stylesheet supports both.

### WP5 — Forms
- **Signup** (email capture for launch notification) and **contact / work together** (D4),
  both via the existing Web3Forms pattern: hidden `access_key`, `FormData` POST,
  `.form-success` / `.form-error` elements present.
- Add a honeypot field for spam.
- State plainly what the email will be used for; link the privacy policy next to the field.

**Gate:** a real test submission arrives; success and error states both render; submitting
with JS disabled degrades acceptably.

### WP6 — Legal pages
Update `privacy.html` (what the signup form collects, how it's used, how to unsubscribe),
`terms.html`, and `unsubscribe.html` for the new context. Do not delete them — a site
collecting emails needs them, and they are already written.

**Gate:** no stale references to staffing, providers, directories, or behavioral-health
services remain in any of the three.

### WP7 — Deploy
**Pushing to `main` is a live production deploy — get Kenneth's explicit confirmation before
pushing.** Cloudflare Pages picks it up in ~15–30 seconds. Then confirm
`seasononehealthcare.com` serves the new site over HTTPS with the `_headers` policies intact.
Note Pages serves clean URLs (`/privacy.html` 308-redirects to `/privacy`) — expected, not a
broken link.

**Gate:** live site loads; headers present (check response headers); forms work in
production, not just locally.

---

## 4. What NOT to do

- **Do not `rm` anything before WP1's tag is pushed.**
- **Do not claim an Android app exists or is coming** unless Kenneth explicitly picks that
  option in D1.
- **Do not put a launch date on the site** — Apple enrollment hasn't started (§0).
- **Do not violate any §2 copy constraint.** Especially: no pass-rate promises, and no
  claim that the content is clinician-verified.
- **Do not delete `_headers`, `CNAME`, or the favicons.**
- **Do not add external script/CDN dependencies** — the current site is self-contained and
  `_headers` is tuned for that.
- **Do not delete `privacy.html` / `terms.html` / `unsubscribe.html`.**

---

## 5. Executor prompt

> Read `Website Code/SITE_REBUILD_PLAN.md` in full first. §0 contains findings verified
> against the repo and the live site — do not re-derive them. Work from
> `Website Code/` (a real git repo, remote `kmiller656/SeasonOneHealthCare`, deploys to
> Cloudflare Pages on push to `main`).
>
> **D1 is locked: iOS only — "Coming soon to the App Store," no Android claim anywhere.**
> Confirm D2–D4 with Kenneth before writing copy (WP4) if he hasn't already. WP1–WP3 can
> proceed immediately.
>
> Work WP1 → WP7 in order, running each gate before moving on. **WP1 (archive tag) must
> complete before anything is deleted.**
>
> Before declaring WP4 done, re-read every line of copy against the §2 constraint list —
> those are Kenneth's own standing legal/positioning rules and they are the most likely
> thing to get violated by ordinary marketing instinct.
