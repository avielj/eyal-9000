# EYAL-9000 — Retirement Prank Site (Design Spec)

**Date:** 2026-06-17
**Target:** Moshe Dana (משה דנה), retiring from the company's internal audit unit (מבקר החברה).
**Goal:** A believable "official" AI system that claims to have learned from all of Moshe's audit reports and will now replace him — escalating into an absurd twist. Pure prank, harmless.

## Delivery & Hosting

- **Entry point:** SMS with a link to the landing page.
- **Hosting:** GitHub Pages (`avielj/eyal-9000`). Static site.
- **Tracking:** Telegram bot, real-time pings to the prankster's chat on every step.

## Design Direction

**A — "Real corporate product"** (chosen). Blue/white enterprise look, looks like a genuine IT product launch. Maximum believability so the twist lands harder. No sci-fi until late.

## User Journey (5 screens, SPA step flow)

1. **Landing** — "EYAL-9000 · Audit Intelligence Platform". Official copy: after 27 years of thorough auditing, the company built a system based on all his reports. "Knowledge transfer 82%" progress bar. CTA: **"התחל תהליך חפיפה"**.
   → Telegram: *"משה פתח את הדף"*
2. **Briefing** — impressive stats (12,000 notes, 4,500 recommendations, 93.7% of his decisions are predictable). CTA: "המשך לאימות זהות".
   → Telegram: *"משה התחיל את הלומדה"*
3. **Lomda** — 5 multiple-choice questions, "official assessment" styling. The "correct" answer is always the most paranoid/thorough.
   → Telegram after each: *"משה ענה שאלה X: <בחירה>"*
4. **Processing** — animation "מנתח את אישיותך… מכייל רמת חשדנות…", bar climbs to 100%.
   → Telegram: *"משה סיים — מגיע לטוויסט"*
5. **Twist + reveal** — system concludes his criticality level cannot be replicated; EYAL-9000 refuses the role ("found too many deficiencies in the system itself"); committee returns him from retirement for 27 more years → reveal: **מתיחה! מזל טוב על הפרישה 🎉** + photo (monkey placeholder).

## The 5 Questions (correct = last/most paranoid)

1. עובד מציג מסמך ללא חתימה. מה תגובתך?
   לאשר · לבקש חתימה · לפתוח ממצא ביקורת · **לפתוח ממצא ולדרוש את הנוהל המקורי משנת 2011** ✓
2. בפגישה נאמר "זה תמיד עבד ככה". דרג את רמת הסיכון:
   נמוכה · בינונית · גבוהה · **קריטית** ✓
3. מנהל מבקש לדלג על תהליך אישור כי "דחוף". מה תעשה?
   לאשר חריג · לתעד ולהמשיך · לפתוח ממצא · **לפתוח ממצא, להקפיא את התהליך ולזמן ועדת בירור** ✓
4. מצאת קובץ אקסל עם נוסחה שהוזנה ידנית. רמת החשד?
   תקין · לבדוק שוב · חשוד · **נוסחה ידנית = ליקוי מהותי עד שיוכח אחרת** ✓
5. עובד: "שלחתי לך את זה במייל לפני שבועיים". תגובתך?
   "אוקיי" · "תשלח שוב" · "אין תיעוד" · **"אין תיעוד = לא קרה. נא להציג אישור מסירה, חותמת זמן ושלושה עדים"** ✓

After each answer the system "confirms" with mock-serious feedback (e.g. "תשובה תואמת את הפרופיל. רמת חשדנות מאומתת.").

## Architecture

- Static, vanilla HTML/CSS/JS. No framework, no build step. Hebrew, RTL.
- `index.html` — all 5 screens as sections; JS shows one at a time.
- `styles.css` — corporate theme, progress bar, processing animation.
- `app.js` — step navigation, quiz logic, progress persistence (`localStorage`), tracking calls.
- `config.js` — single place for: company name, all copy strings, Telegram token + chat id, photo paths. **Tracking is no-op until token/chat id are filled in.**
- `assets/` — monkey placeholder now; real photos + robot graphic later.

## Telegram Tracking

- Each step transition → `fetch` to Telegram `sendMessage` (browser CORS allowed).
- Token lives in `config.js`; on a public repo it's visible in source. Acceptable for a throwaway bot — **revoke after the prank**. Optional hardening: route through a free Cloudflare Worker proxy.
- If token/chat id are blank, tracking silently no-ops so the mockup works standalone.

## Placeholders (to fill later)

- Company name (e.g. ICL Audit Intelligence, or generic).
- Telegram bot token + chat id.
- Moshe's photos (monkey emoji/image placeholder for now).

## Out of Scope

- No backend, no database, no auth. No real data about Moshe.
