# Owner and homepage design plan

Design-first prompts for homepage `/` and owner Zahtjevi, plus five proposal frames. Visual system is Design 1 in this folder (white canvas, black CTAs, Cal Sans + Inter). Not a second pack.

Source: [docs/research/owner-panel.md](../../docs/research/owner-panel.md). That file is not product truth. Product stays in `docs/mvp/`. Do not add routes, mutations, or stories from the frames below.

Homepage and Zahtjevi match the current PWA. Do not restyle them from this file. Frames are not pages.

## Prompt 1 — Homepage `/`

```text
GOAL
- Short-scroll Bosnian homepage for a guest who would otherwise chase a salon on Instagram.
- Success: one path to /salons. Three lines state preferred day+time, salon accepts or adjusts, guest confirms only on a counter-proposal.

FORMAT
- Viewport short scroll, not a poster.
- Column ~1200px. Safe margins ~24px phone, ~48–64px desktop.

LAYOUT (wireframe in words)
- One column. Top-nav, then H1, support, three steps, black CTA, light footer.
- No second column, no product mock, no feature grid.

TYPE SYSTEM
- H1: Cal Sans 600. 32px phone, up to 64px. Tight leading, negative tracking.
- Support, steps, button, footer: Inter. Body 400, button 600.

COLOR + MATERIAL
- Background: canvas #ffffff
- Text: ink #111111, body #374151, footer muted #6b7280
- One accent only: none. Black CTA #111111, press #242424.
- Texture: flat. Hairline only. No grain, no dark footer.

IMAGERY / UI STYLE
- UI style: minimal SaaS
- No photo, no 3D, no illustration

COPY (render EXACTLY)
- Line 1: Rezervacije bez jurnjave za terminom
- Line 2: Odabereš dan i željeno vrijeme. Salon prihvati ili predloži drugo. Potvrdiš samo kad predlože drugačije vrijeme.
- Line 3: Odaberi dan i željeno vrijeme.
- Line 4: Salon prihvati ili prilagodi.
- Line 5: Potvrdiš samo ako predlože drugo vrijeme.
- Line 6: Pronađi salon
- Line 7: Sarajevo
- Line 8: Termini bez jurnjave.

CONSTRAINTS (change 1–2 things only)
- FONT: Cal Sans + Inter
- STYLE: minimal
- MODE: light

NEGATIVE PROMPT
- No payments, waitlist, reviews, WhatsApp, dark footer, English
- No logos, no watermarks
- No extra text beyond provided lines
- No gibberish typography
```

Copy already lives in `esyres_app/frontend/src/i18n.ts` (`pitch.*`, `home.footerCity`, `home.footerLine`). CTA goes to `/salons`.

## Prompt 2 — Owner Zahtjevi `/owner`

```text
GOAL
- Sarajevo owner replacing a notebook and Instagram DMs.
- Success: pending requests are the action. The month is context, not a live slot grid. Owner accepts or counter-proposes. 24/7 intake is the product reason, not a widget.

FORMAT
- App screen. Phone: month stacked above the day list. md+: month left, list right.
- Owner overlay inner stays unconstrained. Card spans main.

LAYOUT (wireframe in words)
- Top-nav overlay, light left OwnerNav, one canvas hairline card.
- Nav: Zahtjevi, Razgovori, Statistika, Saloni, Postavke.
- List order: pending till-pile, soon occupying, then the rest (Predloženo vrijeme, Pauza, Zatvoreno).
- Primary actions only on pending rows. Hierarchy: pending pile → day list → month.

TYPE SYSTEM
- Card and nav: Inter. Titles 600, body 400.
- No Cal Sans on the card.

COLOR + MATERIAL
- Card: canvas #ffffff, hairline #e5e7eb, radius 12px. No heavy shadow, no grey fill on the box.
- Pending pile: surface-soft #f8f9fa.
- Worker-colored dots on occupying days only (max three).
- Status colors are not brand chrome.

IMAGERY / UI STYLE
- UI style: dense minimal tool
- No photo, no 3D

COPY (render EXACTLY)
- Nav: Zahtjevi / Razgovori / Statistika / Saloni / Postavke
- Day titles when they apply: Pauza / Zatvoreno
- Row state label: Predloženo vrijeme
- Pending actions stay the existing accept and Predloži labels

CONSTRAINTS (change 1–2 things only)
- FONT: Inter
- STYLE: minimal
- MODE: light

NEGATIVE PROMPT
- No 15-minute board, drag, payments, worker logins
- No client database on this screen
- No dark nav, no homepage hero or footer
- No logos, no extra chrome text
```

## Frames only

Same tokens as above. Do not implement these in this pass. Do not add routes.

Out of every frame: deposits, POS, rotas, reviews, Viber/WhatsApp, waitlist, worker login.

### Prompt 3 — Customer history (proposal)

```text
GOAL
- Owner sees one guest’s history at this salon: bookings, QR visited, no-show count.
- Success: “know this guest” without a Booksy client OS. Notes only if a later Epic 8 story fits one PR.

FORMAT
- Proposed route /owner/customers. Not built.
- Phone: list then detail. md+: list left, one guest right.

LAYOUT (wireframe in words)
- OwnerNav unchanged. Main is one hairline card.
- List: guest name. Detail: booking rows, QR visited, no-show count. Optional note under the rows.
- Hierarchy: name → last visit → counts → booking rows.

TYPE SYSTEM
- Inter. Name 600, rows 400, counts 14px muted.

COLOR + MATERIAL
- Canvas card, hairline, surface-soft rows. Black is not a second brand. No status rainbow.

IMAGERY / UI STYLE
- UI style: dense minimal list
- No guest photos

COPY (render EXACTLY)
- Title: Gosti
- Empty: Nema gostiju.
- Counts: Posjeta / Nije došao
- Do not invent extra labels

CONSTRAINTS (change 1–2 things only)
- FONT: Inter
- STYLE: minimal
- MODE: light

NEGATIVE PROMPT
- Do not implement. No route, no query, no story file.
- No allergies form, wallet, photos, payments
- No logos, no extra text beyond provided lines
```

Persist later with `/new-story` on Epic 8. Not this file.

### Prompt 4 — Mark no-show (proposal)

```text
GOAL
- After start, the owner records that the guest did not come.
- Success: one control on Request Detail. Booking stays confirmed. Counters can increment later. Not a fee.

FORMAT
- Existing /owner/requests/:id card. Not a new page.

LAYOUT (wireframe in words)
- Same Cal card: name + mode clock, then the existing read block.
- One control under that block, only after start. No second column.

TYPE SYSTEM
- Inter. Control matches owner pills (14px, 600).

COLOR + MATERIAL
- Canvas card, hairline. Control is a hairline pill, not error-strong, not busy-busy.

IMAGERY / UI STYLE
- UI style: same Request Detail card
- No new chrome

COPY (render EXACTLY)
- Control: Nije došao
- Do not add a charge line

CONSTRAINTS (change 1–2 things only)
- FONT: Inter
- STYLE: minimal
- MODE: light

NEGATIVE PROMPT
- Do not implement. Mutation exists; this pass adds no button.
- No deposit, no card on file, no new page
- No logos, no extra text
```

Same future Epic 8 story as customer history, or the next story. Not this pass.

### Prompt 5 — Postavke (already shipped)

```text
GOAL
- Owner rotates the account password without a founder reset.
- Success: the page that already exists. No visual change.

FORMAT
- /owner/settings. Same overlay as the salon catalog. No ?salon=.

LAYOUT (wireframe in words)
- h1, muted read-only email, three password fields, Spremi.
- OwnerNav Postavke is fifth, after Saloni.

TYPE SYSTEM
- Inter. h1 600. Fields and button match owner forms.

COLOR + MATERIAL
- Canvas, hairline, black Spremi. No new accent.

IMAGERY / UI STYLE
- UI style: sparse form
- No illustration

COPY (render EXACTLY)
- Title: Postavke
- Fields: Trenutna lozinka / Nova lozinka / Ponovi lozinku
- Submit: Spremi
- Mismatch: Lozinke se ne poklapaju.
- Wrong current: Pogrešna trenutna lozinka.
- Success: Lozinka je promijenjena.

CONSTRAINTS (change 1–2 things only)
- FONT: Inter
- STYLE: minimal
- MODE: light

NEGATIVE PROMPT
- Do not redesign. See STORY-71 and esyres_app/frontend/src/pages/OwnerSettings.tsx.
- No name or email edit, no show/hide toggles, no customer settings
- No logos, no extra fields
```

### Prompt 6 — QR sticker (proposal)

```text
GOAL
- Owner can print or share the salon QR so a guest lands on the profile with the hold cookie.
- Success: one block on salon tools. Not a guest photo. Not discovery cards.

FORMAT
- Proposed block on owner salon tools. Not built.
- Print sheet is the sticker, not a marketing page.

LAYOUT (wireframe in words)
- One hairline box: salon name, QR, two actions (print, share).
- Hierarchy: name → code → actions.

TYPE SYSTEM
- Inter. Name 600, actions 14px 600.

COLOR + MATERIAL
- Canvas, hairline, black code on white. No brand accent on the code.

IMAGERY / UI STYLE
- UI style: minimal print block
- QR only. No portfolio photo.

COPY (render EXACTLY)
- Title: QR naljepnica
- Actions: Štampaj / Podijeli
- Do not add a slogan on the sticker

CONSTRAINTS (change 1–2 things only)
- FONT: Inter
- STYLE: minimal
- MODE: light

NEGATIVE PROMPT
- Do not implement. GET /qr/{id} already exists. No new owner chrome.
- No guest-visible photos, no Instagram mock
- No logos beyond the QR, no extra text
```

Future `/new-story` (Epic 8, or Epic 7 if treated as salon tools). Not this pass.

### Prompt 7 — Holiday closed day (proposal)

```text
GOAL
- Owner marks one calendar date closed without rewriting the weekly hours template.
- Success: a single exception date. Weekly hours stay the template.

FORMAT
- Proposed row under Radno vrijeme. Not built.
- STORY-53 still forbids a holiday calendar. Frame only until MVP expands.

LAYOUT (wireframe in words)
- Existing hours accordion, plus one date field and a closed label.
- That date reads Zatvoreno on Zahtjevi. No month of exceptions.

TYPE SYSTEM
- Inter. Same as Radno vrijeme labels.

COLOR + MATERIAL
- Canvas panel, hairline. Closed row uses muted text, not a new status color.

IMAGERY / UI STYLE
- UI style: one form row
- No calendar illustration

COPY (render EXACTLY)
- Label: Zatvoren dan
- Row on Zahtjevi: Zatvoreno

CONSTRAINTS (change 1–2 things only)
- FONT: Inter
- STYLE: minimal
- MODE: light

NEGATIVE PROMPT
- Do not implement. Do not add a holiday model or hours UI.
- No multi-day range picker, no worker time off, no rota
- No logos, no extra text
```
