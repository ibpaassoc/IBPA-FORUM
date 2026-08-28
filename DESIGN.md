---
version: alpha
name: "IBPA Beauty Award"
description: "Editorial luxury for the public brand, translated into calm, precise operational surfaces for account and admin work."
colors:
  primary: "#72a0c1"
  ink: "#030213"
  ink-soft: "#46525a"
  blue: "#72a0c1"
  blue-soft: "#b9d9eb"
  blue-wash: "#f2f8fb"
  white: "#ffffff"
  off-white: "#f8f8f6"
  success: "#047857"
  danger: "#702e2e"
typography:
  display:
    fontFamily: "var(--font-display), 'Bodoni Moda', Georgia, serif"
  body:
    fontFamily: "var(--font-body), 'Lora', Georgia, serif"
  accent:
    fontFamily: "var(--font-accent), 'Cormorant Garamond', Georgia, serif"
rounded:
  DEFAULT: "0.625rem"
  sm: "0.375rem"
  lg: "1rem"
  pill: "2.5rem"
spacing:
  page-gutter: "clamp(1rem, 5vw, 4rem)"
  content-width: "75rem"
  section-gap: "clamp(1.5rem, 3vw, 2.5rem)"
components:
  button: {}
  card: {}
  dialog: {}
  input: {}
  table: {}
---

# IBPA Beauty Award Design System

## Overview

### Creative North Star

The interface should feel like an invitation desk at a contemporary international beauty-awards venue: crisp white stationery, pale-blue glass, fine editorial typography, and staff tools arranged with hospitality-level care.

### Product context and register

- **Audience and primary job:** Public visitors discover the forum; jury, members, and internal administrators complete time-sensitive account, nomination, ticket, and communication work.
- **Target market(s) and evidence:** International English-, Russian-, and Ukrainian-speaking users, evidenced by the repository locale provider and account flows. No Japan-market behavior is implied.
- **Locale(s) and language policy:** `en`, `ru`, and `ua`/Ukrainian are supported. User-facing account content follows the active locale; admin operational copy currently follows the established Russian admin convention.
- **Usage scene:** Responsive web use across desktop and mobile. Admin work favors a small-laptop desktop layout with dense but readable records and short focused dialogs.
- **Register:** Hybrid. Public routes carry the full editorial brand; account and admin routes retain the identity while prioritizing task clarity and resilient states.
- **Memorable signature:** A powder-blue editorial control or segmented rail may act as the one expressive anchor in a workflow, such as the jury/member audience slider in the notification composer.
- **Restraint:** Tables, recipient lists, forms, errors, and confirmations stay quiet, familiar, and high contrast.
- **Anti-references:** Avoid generic neon SaaS dashboards, decorative metric-card walls without an operational purpose, and heavy black luxury treatments that reduce readability.
- **Token ownership/runtime mapping:** This file mirrors the canonical runtime variables in `app/globals.css`; Tailwind utilities and shared components consume those variables. Token changes must update both this file and the runtime owner.

## Colors

Ink is the primary text and high-emphasis action color. IBPA blue is the brand/action accent and focus color, while blue wash and white establish surface hierarchy. Success and danger remain semantic and always include text or icon cues. The product currently uses a light theme; forced-color behavior remains system-owned.

## Typography

Bodoni Moda is reserved for page and dialog titles. Lora carries body copy, labels, controls, and data because it includes Cyrillic coverage. Cormorant Garamond is a restrained accent for eyebrows. Uppercase with wide tracking is reserved for short utility labels and buttons, never long prose.

## Layout

The shared page width is 75rem with fluid gutters. Public pages may breathe generously; admin pages use compact cards and bounded list regions while the document remains the primary page scroll owner. Long dialogs keep header and actions reachable and give only their body an internal scroll region. At narrow widths, multi-column forms stack without hiding fields or actions.

## Elevation & Depth

Depth comes from translucent white surfaces, low-contrast blue borders, and soft cool shadows. One elevated dialog may dominate a page; nested floating cards should be minimal. Static data rows rely on rules and tonal changes rather than large shadows.

## Shapes

Fields and list rows use 16–20px rounded corners, primary containers use 24–30px where space permits, and compact high-frequency controls may use the pill radius. Circles are reserved for icons, avatars, and icon-only actions.

## Components

### Foundational visual states

Enabled controls show hover, visible blue focus rings, pressed feedback, and pointer cursors. Selected controls combine color with position, border, or icon state. Busy controls preserve geometry and expose status text. Errors remain adjacent to the field or workflow that needs correction.

### Buttons and actions

Primary actions use a blue solid pill with a specific verb. Secondary actions use a white outline. Icon-only controls are at least 44px and always have an accessible label. Destructive actions use the muted wine danger token and remain visually separated from safe actions.

### Navigation and data display

Admin journals use semantic tables on wide screens and labeled record cards on narrow screens. Search includes an explicit clear action. Selection always reports its exact count and scope.

### Forms and overlays

Fields have persistent labels, blue focus rings, app-owned validation, and stable help/error space. Textareas do not resize. Modal dialogs are portaled, trap focus, make the background inert, close with Escape when safe, restore focus, and keep actions visible within the viewport.

### Iconography

Lucide is the canonical icon family, normally 16–20px with restrained strokes. Icons support text; they do not replace important labels.

### Motion

Motion is soft and editorial: roughly 180ms for control feedback and 260–420ms for content or overlay transitions using the established editorial easing. Reduced-motion preferences collapse movement without removing state changes.

### Content and data visualization

Copy uses direct verbs and concrete outcomes. Creation labels and success messages keep the same action vocabulary. Dates are formatted by the active surface locale; raw backend errors never reach users.

## Do's and Don'ts

- **Do:** Let one pale-blue interaction carry the brand signature while keeping the rest of the workflow disciplined.
- **Do:** Reuse shared admin buttons, cards, inputs, status badges, and locale-aware formatters.
- **Don't:** reintroduce decorative statistics when the route's job is composing and reviewing notifications.
- **Don't:** hide templates, recipients, field errors, or essential actions behind hover-only behavior.
