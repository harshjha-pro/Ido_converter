---
name: idoconverter-design
description: "Use this skill whenever building, styling or reviewing any UI in the idoconverter project — pages, components, the navbar/footer, tool cards, or the browser extension popup. Covers the project's color tokens, typography pairing, spacing scale, and anti-slop rules. Trigger for any CSS, layout, color, font or component work, and before marking any visual task as done."
---

# idoconverter visual design system

Full source: `docs/DESIGN.md`. This skill is the condensed, always-applicable version for day-to-day UI work. If `docs/DESIGN.md` and this file ever disagree, `docs/DESIGN.md` wins — update this file to match it, don't silently follow this one.

## Part A: General design discipline (applies everywhere)

- **Spacing:** strict scale only — 4 / 8 / 16 / 24 / 32 / 64px. No arbitrary values.
- **Alignment:** headings, containers and cards align to the same vertical edges, on a structured column grid. No near-misses.
- **Typography:** clear hierarchy h1 → body, consistent weights (regular body, medium/semibold labels/headers). Body line length ~50–75 characters, line-height 1.5–1.7.
- **Color:** use CSS variable tokens only, never raw hex in component code. Text must hit WCAG AA (≥4.5:1) against its background — calculate and state the real ratio, don't eyeball it.
- **Anti-slop:** no default gradients, no emoji bullets, no heavy-bordered rounded cards, no floating gradient orbs. Exactly one visually dominant call-to-action per page/section.
- **Constraints that override everything else:** no third-party CDNs on tool pages, no new font/library dependency without asking first (AGENTS.md rule 3), must work at 360px width. Tool pages are input-box/output-box utilities, not marketing pages — don't force illustrated cards or stock imagery onto them.

## Part B: idoconverter's specific tokens

| Token | Value | Use |
|---|---|---|
| `--color-bg` | `#F4F0E4` | Main background (warm cream) |
| `--color-bg-dark` | `#12382A` | Dark sections, footer (deep forest green) |
| `--color-accent` | `#2F8F52` | Emphasis text, links, hover states |
| `--color-button` | `#111111` | Primary button background, pill-shaped |
| `--color-button-text` | `#FFFFFF` | Text on primary buttons |
| `--color-highlight` | `#F2C94C` | Sparing use only (one badge/state), never body text until contrast is confirmed |
| `--color-text` | *(confirm ≥4.5:1 on `--color-bg` before using)* | Main body text |
| `--color-text-on-dark` | *(confirm ≥4.5:1 on `--color-bg-dark`)* | Text on dark sections |

**Typography:** a serif used ONLY in italics for emphasis words inside headings, paired with a sans-serif for everything else (nav, body, buttons, tool input/output). Both fonts must be self-hostable — if either isn't installed yet, use the system font stack and ask before adding a new font dependency.

**Buttons:** solid `--color-button`, fully rounded/pill-shaped, white text. One primary button per page; secondary actions are plain links or outlined, never a second competing solid button.

**Cards:** generous rounded corners, soft (not heavy) shadow, generous padding. Every tool card uses the same treatment regardless of profession — don't make one section look more "finished" than another.

**Navbar:** logo left, nav links centered, one solid black pill button right. At 360px, collapses to hamburger or a simple stacked list — pick one approach and use it everywhere.

**Footer:** full-width `--color-bg-dark`, a centered rounded CTA card in the same green family (plain or a simple original shape — never copy illustrated wave/dot art from any reference), standard footer links, same contrast rule applies.

## What NOT to do

- No stock photography, no faces, no illustrated dashboard mockups, no decorative wave/dot art, no testimonial carousels. These were deliberately left out of the reference this palette came from — don't reintroduce them because they "look nice."
- No new color outside the token table above without updating `docs/DESIGN.md` first.
- No font swap without approval (AGENTS.md rule 3) — this includes "just testing" a different font locally.

## Before marking any UI task done

1. Every color used is one of the tokens above — grep for raw hex values if unsure.
2. Contrast ratios calculated and stated, not assumed.
3. Spacing only from the defined scale.
4. Works at 360px — verify with the Chrome DevTools MCP if it's configured, don't just assume.
5. Exactly one dominant CTA per page/section.
