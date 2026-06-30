# Project Rules & Custom Instructions

This file contains custom instructions and guidelines for the development of the Korea Senior Interaction Society (KSIS / 한국시니어교류협회) web application.

---

## 🚨 CRITICAL: UI & LAYOUT FREEZE RULE (디자인 및 레이아웃 수정 절대 금지)
- **NO VISUAL ALTERATIONS**: Any future developer, writer, or AI agent **MUST NOT** modify, rearrange, or delete any existing UI layouts, structures, CSS styles, colors, alignments, spacing, padding (`p-`, `pt-`, `pb-`, `py-`), margins (`m-`, `mt-`, `mb-`, `my-`), or Tailwind utility classes.
- **DESKTOP & MOBILE RESPONSIVENESS PRESERVATION**: The current responsive breakpoints, padding levels, and layout containers are carefully optimized and **FROZEN**. You are strictly forbidden from altering them.
- **CONTENT-ONLY PERMISSION**: Future operations are strictly limited to updating or adding text content, data items (e.g., board posts, calendar events, schedule lists), and resolving functional bugs without touching the visual presentation.

---

## Mobile Layout & Spacing Rules
- **Margins & Padding**: On mobile viewports (`sm:` or `< md`), always keep margins and paddings compact (e.g., `pt-4 pb-4 px-4` or `py-4`) instead of large values like `pt-24 pb-16 px-6`.
- **Hero Title Styling**: Keep subtitle display texts (like large background texts) bounded to reasonable responsive sizes on mobile (e.g., `text-[10vw]` or `text-2xl` instead of rigid layouts that cause excessive overflows).
- **Typography Sizing**: Set standard human-readable sizes on mobile screens (`text-2xl` for headings, `text-sm` for details) to ensure there is no text wrapping in an ugly manner.

---

## Page-Specific Guidelines

### About Page (`/about` or `/identity`)
- **CI Emblem**: Keep the CI emblem centered at `max-h-[280px]` on desktop and properly scaled on mobile.
- **Hero Spacing**: Keep the Hero/Title section very compact on mobile viewports (`pt-4 pb-4 min-h-[120px]`).
- **No Style Changes**: The layout, typography sizes, and margins are finalized.

### Board Page (`/community` / `/board`)
- **No Uppercase Tag**: Do not display the uppercase tag "KSIS ASSOCIATION BOARD" above the main heading.
- **Layout Integrity**: Maintain the clean post list, card structures, and search alignments exactly as they are.

### Calendar Page (`/calendar`)
- **Calendar Container**: Maintain a clean calendar container that adapts fluidly to mobile viewports.
- **Mobile Spacing**: Keep mobile spacing compact (`py-4 px-4`) to make sure that calendars and event timelines are fully visible and readable. Do not introduce extra vertical padding on mobile views.
