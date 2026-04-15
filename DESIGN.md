# Design System — paymebackpls

## Product Context
- **What this is:** Zero-friction bill splitter. Payer uploads receipt, friends open a link, claim items, pay via Venmo.
- **Who it's for:** Friend groups splitting dinner bills. 20s-30s, mobile-first.
- **Space:** Bill splitting / casual payments (Splitwise, Venmo, Tab)
- **Project type:** Mobile-first web app

## Aesthetic Direction
- **Direction:** Clean luxury
- **Decoration level:** Minimal — typography and whitespace do all the work
- **Mood:** Feels like the receipt from a restaurant you'd want to go back to. Refined, warm, confident. Not fintech-cold, not startup-playful.
- **Reference:** High-end restaurant menus, editorial layouts, Aesop, Apple

## Typography
- **Display/Hero:** Instrument Serif (400) — the personality of the app. Used for the hero total amount, app name, and share headings. Warm, elegant, distinctive.
- **Body/UI:** DM Sans (400, 500, 600) — clean, slightly warm humanist sans. All item names, labels, metadata, buttons.
- **Data/Prices:** DM Sans (500) with `font-variant-numeric: tabular-nums` — numbers align in columns
- **Loading:** Google Fonts: `Instrument+Serif:ital@0;1` and `DM+Sans:opsz,wght@9..40,300..600`
- **Scale:**
  - Hero total: 56px, Instrument Serif 400
  - App name: 22px, Instrument Serif 400
  - Section headings: 15px, DM Sans 700 (not serif)
  - Item names: 15px, DM Sans 500
  - Body: 14-15px, DM Sans 400
  - Labels: 11px, DM Sans 500, uppercase, letter-spacing 0.1em
  - Meta: 12-13px, DM Sans 400

## Color
- **Approach:** Restrained — almost monochrome with semantic greens/reds only
- **Background:** `#F7F6F3` (warm off-white)
- **Surface/cards:** `#FFFFFF`
- **Text primary:** `#111111`
- **Text secondary:** `#6B6B6B`
- **Text tertiary:** `#787878`
- **Accent/CTA:** `#111111` (black — the buttons are black)
- **Claimed highlight bg:** `#F0EDE7` (warm tan)
- **Claimed border:** `#111111` (2px left border)
- **Border:** `#E5E3DF`
- **Border light:** `#EDEBE7`
- **Success (Venmo):** `#1A7F37`
- **Danger:** `#CF222E`
- **Warning:** `#92600A`
- **No dark mode** — ephemeral 30-second interaction, one mode done well

## Spacing
- **Base unit:** 8px
- **Density:** Comfortable — generous for a financial app
- **Content padding:** 24px horizontal
- **Between sections:** 28px
- **Card padding:** 16px
- **Item row padding:** 14px vertical
- **Max content width:** 448px

## Layout
- **Approach:** Single-column, mobile-first
- **Grid:** None — single column, no sidebars
- **Max content width:** 448px centered
- **Border radius:**
  - Inputs: 4-8px (subtle, not bubbly)
  - Cards: 8-12px
  - Buttons: 4px (rectangular, not pill — luxury feel)
  - Pill buttons: only for claim/unclaim badges

## Motion
- **Approach:** Minimal-functional
- **Easing:** ease-out for enters, ease-in for exits
- **Duration:** 150ms for button states, interactions
- **Claim interaction:** subtle scale(0.99) on press + background transition
- **No bouncing, no spring physics, no decorative animation**

## Component Patterns
- **Inputs:** Underline-only (border-bottom), no box borders on upload form
- **Items in review mode:** Ruled lines (border-bottom separators), not cards
- **Items in friend claim mode:** Ruled lines. Claimed items get warm tan bg + black left border, extending full width with negative margin
- **Fully claimed items:** 35% opacity, no interaction
- **Buttons:** Black fill for primary CTA, 1px border for secondary. Not rounded — 4px radius.
- **Claim badges:** Plain text, no pill backgrounds. Format: "You · Full" / "Alex · 1/2"

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-14 | Clean luxury aesthetic chosen | User reviewed warm-minimal (v1), clean-luxury (v2), and gen-z/partiful (v3). v2 selected for its refined, editorial feel. v3 rejected as "cheap." |
| 2026-04-14 | Instrument Serif for display | Gives the app personality without decoration. Serif totals are distinctive in the payment app space. |
| 2026-04-14 | Almost monochrome palette | No brand accent color. Black CTAs, warm neutrals, semantic green/red only. Restraint IS the brand. |
| 2026-04-14 | No dark mode | 30-second ephemeral interaction. One mode, done perfectly. |
| 2026-04-14 | Tertiary text darkened to #787878 | #A3A3A3 failed WCAG AA contrast (2.33:1) on all backgrounds. #787878 passes 4.5:1 while preserving 3-tier hierarchy. |
| 2026-04-14 | Dynamic OG metadata for shared links | Product's distribution is link sharing. Bare URLs in iMessage look like spam. Dynamic preview shows payer name + bill description. |
| 2026-04-14 | Per-item tap affordance (+ icon) | Unclaimed items looked like plain text. Small circle with "+" makes claim interaction discoverable. Checkmark when claimed. |
| 2026-04-14 | Mark as paid + per-person summary | Closes emotional loop after Venmo payment. Gives payer visibility into who has paid. |
