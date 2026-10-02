# idoconverter — Design System

**Version:** 0.2  
**Status:** Approved visual direction  
**Purpose:** Single source of truth for the visual design, UI components, homepage composition, responsive behavior, accessibility, and visual quality of idoconverter.

---

# 1. Design Direction

idoconverter is a premium, privacy-first SaaS-style toolbox for practical professional tasks.

The visual identity should feel:

- Premium
- Calm
- Practical
- Professional
- Technical
- Trustworthy
- Clean
- Focused

It should **not** feel like:

- A generic online converter website
- A cheap/free utility directory
- A developer-only dashboard
- A generic AI landing page
- A corporate enterprise product
- An eco/nature brand
- A crypto/web3 product
- A heavily futuristic/cyberpunk interface

## Core design idea

The interface should visually communicate:

**Professional task → browser tool → local processing → useful result**

The product itself should create the visual interest.

Do not depend on decorative effects to make the site look premium.

---

# 2. Brand Promise

Primary brand message:

> **Tools made to fit your task.**

Supporting message:

> **Runs in your browser. Your data never leaves your device.**

Product characteristics communicated visually:

- Small, focused tools
- Browser-based
- Privacy-first
- No unnecessary account friction
- Practical professional workflows
- Fast and easy to understand

The privacy promise is a product feature and should be visible throughout the site without becoming repetitive.

---

# 3. Color System

## 3.1 Core palette

| Token | Hex | Purpose |
|---|---|---|
| Background / Cream | `#F4F0E4` | Main page background |
| Dark / Deep Forest | `#12382A` | Dark sections, footer, major CTA sections |
| Dark Inner | `#1A4D3A` | Inner CTA/card area inside dark sections |
| Primary / Near Black | `#111111` | Primary buttons, strong controls |
| White | `#FFFFFF` | Cards, elevated UI panels, button text |
| Accent Green | `#2F8F52` | Large accents, emphasis, badges |
| Link Green | `#236E3F` | Text links and accessible green text |
| Highlight Yellow | `#F2C94C` | Small badges, featured accents, dark-section CTA |
| Muted | `#5F6662` | Muted text, borders, secondary UI |
| Error Red | `#B42318` | Error messages only (5.77:1 on cream, 6.57:1 on white) |

## 3.2 CSS tokens

```css
:root {
  --color-bg: #F4F0E4;
  --color-dark: #12382A;
  --color-dark-inner: #1A4D3A;
  --color-primary: #111111;
  --color-white: #FFFFFF;
  --color-accent: #2F8F52;
  --color-link: #236E3F;
  --color-yellow: #F2C94C;
  --color-muted: #5F6662;
  --color-error: #B42318;

  --color-card-bg: #FFFFFF;

  --radius-card: 16px;
  --radius-card-large: 24px;
  --radius-pill: 9999px;
}
```

## 3.3 Color usage

### Cream — `#F4F0E4`

The default page background.

Use it for:

- Main page
- Hero background
- Tool/category sections
- FAQ
- Pricing
- Testimonials
- General content sections

### Deep forest — `#12382A`

Use for:

- Featured tool section
- Final CTA
- Footer
- Strong privacy/product sections

### Dark inner — `#1A4D3A`

Use for:

- Inner CTA cards
- Secondary dark surfaces
- Subtle depth within dark sections

### Near black — `#111111`

Use for:

- Primary buttons
- Main navigation CTA
- Strong action controls

### White — `#FFFFFF`

Use for:

- Cards
- Product preview panels
- Elevated interfaces
- Input/output panels

### Accent green — `#2F8F52`

Use for:

- Large visual accents
- Status badges
- Success states
- Emphasis where appropriate

### Link green — `#236E3F`

Use for:

- Text links
- Accessible green text
- Secondary interactive text

### Yellow — `#F2C94C`

Use sparingly for:

- Featured labels
- Small badges
- Highlighted words
- CTA buttons on dark backgrounds

Do not use yellow as ordinary body text on the cream background.

### Muted — `#5F6662`

Contrast: 5.17:1 on cream `#F4F0E4`, 5.89:1 on white (WCAG AA). The earlier value `#88928A` was 2.82:1 and failed.

Use for:

- Secondary text
- Borders
- Dividers
- Supporting metadata

---

# 4. Color Restrictions

Do not introduce arbitrary colors.

The approved palette should dominate the interface.

Do not use:

- Neon gradients
- Rainbow gradients
- Purple SaaS gradients
- Bright blue UI accents
- Random pink accents
- Random violet accents
- Large multicolor illustrations

If a new color is genuinely required by a specific tool, it must be proposed before being added to the design system.

---

# 5. Typography

## 5.1 Primary font

**Inter**

Use for:

- Body text
- Navigation
- Buttons
- Labels
- Inputs
- Tool interfaces
- Metadata
- FAQ
- Cards

The original design system specifies Inter as the base/UI font and intended self-hosting through `@fontsource/inter`.

## 5.2 Display/emphasis font

**Playfair Display**

Use **only in italic form** for emphasis words inside large headings.

Example:

```text
Tools made to
fit your task.
```

Where:

- `Tools made to` → Inter
- `fit your task.` → Playfair Display Italic

Do not use Playfair Display for:

- Body copy
- Navigation
- Buttons
- Tool controls
- Long paragraphs
- Metadata

## 5.3 Type scale

```text
H1: 2.5rem / 40px
H2: 2rem / 32px
H3: 1.5rem / 24px
Body: 1rem / 16px
Small: 0.875rem / 14px
```

Responsive sizes may scale down while preserving hierarchy.

---

# 6. Typography Rules

Headings should be:

- Short
- Strong
- Clear
- Spacious
- Sentence case

Avoid:

- All-caps large headings
- Long marketing paragraphs
- Excessive bold text
- Multiple competing typefaces
- Decorative type effects

Use italic serif emphasis intentionally rather than decorating every heading.

---

# 7. Spacing System

Use the approved 4px-based spacing scale:

```text
4px
8px
16px
24px
32px
48px
64px
```

Do not introduce arbitrary spacing values unless necessary.

## Typical usage

```text
4px  — tiny internal gap
8px  — icon/text gap, compact controls
16px — card internal spacing, small sections
24px — card padding / component spacing
32px — section internal spacing
48px — major component spacing
64px — major section spacing
```

The homepage should feel spacious.

Premium quality should come from whitespace and hierarchy rather than decoration.

---

# 8. Layout

## General

- Mobile first
- Wide desktop composition
- Strong alignment
- Consistent max-width container
- Generous horizontal margins
- Clear vertical rhythm

Content should generally sit inside a centered container.

Avoid full-width text blocks except where intentionally used for:

- Dark feature sections
- Footer
- Major CTA backgrounds

---

# 9. Border Radius

Use generous rounded corners.

Recommended:

```text
Small controls: 10–12px
Cards: 16px
Large cards/sections: 24px
Buttons: 9999px
```

Do not mix many unrelated corner radii.

---

# 10. Shadows

Use subtle shadows.

Cards should feel elevated but not floating.

Preferred effect:

- Low opacity
- Large blur
- Small vertical offset
- No dramatic black shadows

Avoid:

- Heavy drop shadows
- Neon shadows
- Colored glow
- Excessive depth

---

# 11. Borders

Borders should be subtle.

Use muted or low-contrast borders when needed to:

- Separate cards
- Define inputs
- Define navigation
- Improve accessibility
- Separate footer areas

Do not outline every component.

---

# 12. Buttons

## Primary button

```css
background: #111111;
color: #FFFFFF;
border-radius: 9999px;
```

Typical copy:

```text
Explore All Tools →
Try JSON PII Masker →
```

## Secondary button

- Transparent or cream surface
- Dark border
- Dark text
- Pill shape

Example:

```text
See How It Works
```

## Dark-section CTA

Use:

```css
background: #F2C94C;
color: #111111;
border-radius: 9999px;
```

## Button rules

- Clear action text
- Comfortable horizontal padding
- Minimum touch target suitable for mobile
- Visible hover state
- Visible keyboard focus state
- No gradient buttons
- No excessive animation

---

# 13. Navigation

Desktop structure:

```text
idoconverter

Tools
Professionals
About
Contact

Explore Tools →
```

Rules:

- Logo left
- Navigation centered/naturally distributed
- Primary CTA right
- Clean cream background
- Minimal visual noise
- Subtle bottom separation
- Pill CTA
- Responsive at 360px

Mobile navigation must not create horizontal overflow.

---

# 14. Logo / Wordmark

The wordmark should be visually simple and premium.

Recommended presentation:

```text
idoconverter
```

A small abstract utility/data-related mark may accompany the wordmark.

Do not use:

- Leaves
- Nature symbols
- Generic lightning logos
- Random AI sparkle marks
- Complex mascots

The brand mark should reinforce tools/data/utility rather than unrelated concepts.

---

# 15. Iconography

Icons should be:

- Simple
- Consistent
- Line-based or restrained filled icons
- Professional
- Easy to understand

Use icons for:

- Privacy
- Tools
- Profession categories
- Workflow steps
- Status
- Navigation

Avoid emoji as interface icons.

The existing design rules specifically prohibit emoji bullets.

---

# 16. Homepage Structure

The homepage must use this order:

```text
1. Header
2. Hero
3. Profession / tool categories
4. Trust / benefits
5. Featured tool
6. How it works
7. Pricing
8. Why people use idoconverter
9. Testimonials
10. FAQ
11. Final CTA
12. Footer
```

## Critical ordering rule

**Pricing belongs in the middle of the homepage.**

The final CTA must be immediately before the footer.

Correct:

```text
FAQ
↓
Final CTA
↓
Footer
```

Incorrect:

```text
FAQ
↓
Pricing
↓
Footer
```

---

# 17. Hero

## Eyebrow

Example:

```text
BROWSER-BASED TOOLS FOR REAL WORK
```

Small pill/badge.

Use yellow as a restrained accent.

## Main heading

```text
Tools made to
fit your task.
```

Use Playfair Display italic for:

```text
fit your task.
```

## Privacy statement

```text
Runs in your browser. Your data never leaves your device.
```

This is one of the strongest messages on the page.

## Supporting copy

Communicate that the site provides:

- Small focused tools
- Developers
- Online sellers
- Job seekers
- Exam/form applicants
- More professions later

Keep it concise.

## CTAs

Primary:

```text
Explore All Tools →
```

Secondary:

```text
See How It Works
```

## Hero trust row

```text
✓ 100% in your browser
✓ No sign-up
✓ Free to use
```

## Hero product preview

Show a premium JSON PII Masker UI.

The visual should communicate:

```text
Input JSON → Masked Output
```

Include:

- Input panel
- Output panel
- Code lines
- Masked values
- Copy button
- Local-processing badge
- Security/privacy indicator

The UI preview must look like an actual product interface.

---

# 18. Profession Cards

Use six profession cards.

## Current Phase 1

### Developers
Transform, clean and safely share data such as JSON, SQL and logs.

### Online sellers
Calculate costs, check weights and prepare marketplace assets.

### Job seekers
Get help with resumes, offers and salary calculations.

### Exam and form applicants
Create photos and documents that meet portal size rules.

## Future

### CAs and accountants
GST, TDS and bank-data tools for daily work.

Badge:

```text
Coming soon
```

or:

```text
Planned (Phase 2)
```

### Frontend developers
Quick CSS, color and unit conversions.

Badge:

```text
Coming soon
```

or:

```text
Planned (Phase 3)
```

Do not make future categories look like currently available products.

---

# 19. Trust / Benefits Strip

Use four benefits:

### 100% Private
Your data never leaves your browser.

### No Sign-up
Start using tools right away.

### No Daily Limits
Use as much as you need.

### Works on Any Device
Chrome, Edge, Firefox and Safari.

Use simple icons and strong typography.

---

# 20. Featured Tool

Use a deep forest-green section.

Featured tool:

**JSON PII Masker**

Headline:

```text
Mask sensitive data
in seconds.
```

Use yellow/serif emphasis for:

```text
in seconds.
```

Supporting copy:

- Remove sensitive information before sharing
- Runs in browser
- No uploads
- No logs

CTA:

```text
Try JSON PII Masker →
```

Product preview:

- Input JSON
- Masked JSON
- Mask by key name
- Detect by pattern
- Keep JSON structure
- Get summary of changes
- Local-processing badge

---

# 21. How It Works

Heading:

```text
Simple. Fast. Private.
```

Supporting line:

```text
No uploads, no accounts, no unnecessary steps.
```

Three steps:

### 1
Paste your data

### 2
Convert or process

### 3
Get your result

Use numbered indicators and subtle arrows.

---

# 22. Pricing Section

Pricing is a **Phase 4 planned feature**.

All tools remain free in Phases 1–3.

Pricing may appear on the homepage as a future-product section, but it must never imply that paid plans are currently active.

## Planned tiers

| Tier | Price | Current status |
|---|---:|---|
| Free | ₹0 | Current |
| Basic | ₹29/month or ₹89/year | Unconfirmed / Coming Soon |
| Plus | ₹129 | Period unconfirmed / Coming Soon |
| Premium | ₹429 | Period unconfirmed / Coming Soon |

## Important

Do not invent the feature list.

Confirmed direction:

- Free: all tools, no storage, no history
- Paid tiers: storage and previous-conversion history are intended
- Exact limits/features: not finalized

Display:

```text
Planned for Phase 4
```

and:

```text
Final pricing, features and plan structure are still being decided.
```

Do not call one plan:

```text
Best
Most popular
Recommended
```

because the pricing structure is not finalized.

---

# 23. Why People Use idoconverter

Four cards:

### Keep your data private
Everything runs locally in your browser.

### Get real work done
Tools built for actual tasks, not demos.

### Simple and focused
No sign-up, no limits, no unnecessary clutter.

### Made for professionals
Tools that fit real daily work.

---

# 24. Testimonials

Section heading:

```text
Built for real people, real work.
```

Use three cards in the visual design.

Each card:

- Small avatar
- Short quote
- Name
- Profession

Do not publish invented testimonials.

During mockup/design work, placeholders are acceptable.

Production requires real user feedback.

---

# 25. FAQ

Heading:

```text
Quick answers.
```

Suggested questions:

```text
Do you upload or store my data?
Are these tools really free to use?
Do I need to create an account?
Which devices and browsers are supported?
```

Use native expandable `<details>` / `<summary>` where appropriate.

FAQ should remain lightweight.

---

# 26. Final CTA

This MUST be the last content section before the footer.

Use deep forest green.

Headline:

```text
Get the right tool for
your next task.
```

Use Playfair Display italic for:

```text
your next task.
```

Supporting copy:

```text
Fast, private and free tools for your real work —
all in your browser, no uploads, no accounts.
```

CTA:

```text
Explore All Tools →
```

## Decorative language

Use product-related visuals only:

- Small tool UI tiles
- Code snippets
- Data transformation arrows
- Security icon
- Browser-window details
- Subtle grid
- Small yellow accents

Do NOT use leaves.

---

# 27. Footer

Background:

```text
#12382A
```

The footer should feel like a premium continuation of the product, not a separate template.

## Footer columns

### Brand

```text
idoconverter

Tools made to fit your task.

Small, focused tools for developers,
online sellers, job seekers, exam
applicants and more.

Runs in your browser.
Your data never leaves your device.
```

### Tools by profession

- Developers
- Online sellers
- Job seekers
- Exam and form applicants
- CAs and accountants
- Frontend developers

### Popular tools

Phase 1 tools may include:

- JSON PII Masker
- Consistent Pseudonymizer
- Log and Secret Scrubber
- SQL Output to JSON
- JSON to TypeScript & Zod
- JSON Repair
- Notice Period Buyout Calculator
- Volumetric Weight Calculator
- Return-Loss Calculator
- Visa & Passport Photo Sizer

### Company

- About
- Contact
- Privacy Policy
- Terms
- Disclaimer
- Sitemap

### Updates

Optional email signup.

If implemented, it must not imply that tool input is collected.

## Footer bottom bar

```text
© 2026 idoconverter. All rights reserved.

Privacy
Terms
Disclaimer
Sitemap
```

---

# 28. Tool Page Design

Every tool page follows a standard structure.

```text
H1 / title
↓
Tool UI above the fold
↓
Short how-to
↓
Privacy statement
↓
FAQ
↓
Related tools
```

Tool privacy line:

```text
Runs in your browser. Nothing is uploaded.
```

Tool pages should be focused and conversion-oriented.

Do not overwhelm the tool UI with advertisements or unrelated content.

---

# 29. Tool UI Design

Tool interfaces should feel like premium professional software.

Use:

- White cards
- 16–24px radius
- Clear labels
- Strong hierarchy
- Comfortable inputs
- Black primary action
- Green status indicators
- Yellow only for meaningful highlights
- Clear success/error states

For code/data tools:

- Monospace font inside code/data areas where appropriate
- Line numbers when useful
- Syntax-aware visual hierarchy
- Input/output comparison
- Copy action
- Clear result state

---

# 30. Input Components

Inputs should:

- Have clear labels
- Be keyboard accessible
- Have visible focus states
- Use white backgrounds
- Use subtle borders
- Use generous padding
- Work on mobile

Do not use tiny input controls.

---

# 31. Status States

## Success

Use green.

Examples:

```text
Done
Copied
Runs locally
No sensitive values found
```

## Warning

Use restrained yellow.

Examples:

```text
Review before sharing
Pattern-based detection may miss secrets
```

## Error

Use a clear high-contrast treatment without introducing a new brand color unless required.

Error messages should be human-readable.

Never expose raw exceptions to users.

---

# 32. Privacy Visual Language

Privacy should be represented by:

- Shield icons
- Lock icons
- Browser-local badges
- Input/output transformations
- “Runs locally” labels
- Subtle security UI

Do not use:

- Padlock overload
- Fake security certifications
- “Military-grade”
- “100% secure”
- Unsupported security guarantees

The accurate claim is specifically that tool processing occurs in the browser and user input is not sent to the server.

---

# 33. Decorative Visual Language

Approved decoration:

- Subtle technical grids
- Dots
- Thin lines
- Data arrows
- Code fragments
- Browser chrome
- Small yellow marks
- Monochromatic gradients inside cards
- Very subtle depth

The visual language should suggest **data transformation and professional tools**.

---

# 34. Prohibited Decorative Language

Do not use:

- Leaves
- Botanical illustrations
- Nature motifs
- Random floating orbs
- Giant blobs
- Excessive glassmorphism
- Neon glows
- Cyberpunk grids
- 3D cartoon objects
- Stock photography
- Generic AI illustrations
- Emoji bullets
- Random abstract shapes
- Excessive gradient backgrounds

---

# 35. Images and Illustrations

The product should rely primarily on UI previews rather than decorative photography.

Preferred visual content:

1. Actual product UI
2. Tool interface mockups
3. Browser-window previews
4. Data/code transformation previews
5. Simple icons

Avoid generic stock photography.

People should not be necessary to explain the product.

---

# 36. Motion

Motion should be subtle and functional.

Allowed:

- Button hover
- Card hover
- Arrow movement
- Accordion expansion
- Small status transitions
- Gentle product-preview transitions

Avoid:

- Constant floating animations
- Parallax everywhere
- Large background motion
- Auto-playing decorative effects
- Excessive scroll animations

The page must remain calm.

---

# 37. Responsive Design

Minimum supported width:

```text
360px
```

## Desktop

- Multi-column grids
- Large hero composition
- Side-by-side product previews
- 3 × 2 profession grid
- Four-column benefit strip
- Multi-column footer

## Tablet

- Reduce spacing
- Preserve hierarchy
- Reduce grid columns where necessary
- Keep product previews readable

## Mobile

- Single-column content
- Stacked hero
- Product preview below hero copy
- Profession cards stacked
- Benefits stacked or compact horizontal arrangement
- Pricing cards stacked or horizontally scrollable
- Footer columns stacked
- Buttons may become full-width

Never create horizontal page overflow.

---

# 38. 360px Rule

Every page must remain usable at 360px width.

Check:

- Header
- Logo
- Navigation
- Hero
- Buttons
- Tool preview
- Cards
- FAQ
- Pricing
- CTA
- Footer

No text should overlap.

No buttons should become inaccessible.

No product preview should force the page wider than the viewport.

---

# 39. Accessibility

Must support:

- Keyboard navigation
- Visible focus states
- Semantic heading hierarchy
- Accessible labels
- Accessible buttons
- Sufficient color contrast
- Readable text
- Touch-friendly controls

The design system previously verified key contrast combinations at WCAG AA-level ratios.

Do not sacrifice accessibility for visual styling.

---

# 40. Anti-Slop Rules

Every visual element must serve one of these purposes:

- Product
- Workflow
- Privacy
- Professionalism
- Navigation
- Trust
- Transformation

If it does not serve one of these, remove it.

Never add decoration simply because the section feels empty.

Whitespace is acceptable.

Premium does not mean visually crowded.

---

# 41. Content Accuracy

Never invent:

- Tool capabilities
- Pricing features
- Final pricing
- Pricing periods
- User testimonials
- Reviews
- Security certifications
- Statistics
- Tax rules
- Visa requirements
- Courier divisors
- Professional claims

If something is unresolved, label it honestly:

```text
Coming soon
```

```text
Planned for Phase 2
```

```text
Planned for Phase 3
```

```text
Planned for Phase 4
```

---

# 42. Current Profession Visual Status

| Profession | Phase | Visual status |
|---|---|---|
| Developers | Phase 1 | Active |
| Online sellers | Phase 1 | Active |
| Job seekers | Phase 1 | Active |
| Exam and form applicants | Phase 1 | Active |
| CAs and accountants | Phase 2 | Coming soon |
| Frontend developers | Phase 3 | Coming soon |

---

# 43. Current Phase 1 Tools

## Developers

- JSON PII Masker
- Consistent Pseudonymizer
- Log and Secret Scrubber
- SQL Console Output → JSON
- JSON → TypeScript / Zod
- JSON Repair

## Job seekers

- Notice Period Buyout Calculator

## Online sellers

- Volumetric Weight Calculator
- Return-Loss Calculator

## Exam and form applicants

- Visa and Passport Photo Sizer

---

# 44. Homepage Visual Hierarchy

The homepage should visually prioritize:

```text
1. Brand promise
2. Privacy
3. Product/tool experience
4. Professional categories
5. Available tools
6. Future pricing
7. Trust
8. Final action
```

Do not allow:

- Pricing to dominate the homepage
- Testimonials to dominate the product
- Decorative graphics to dominate the hero
- Footer to feel like the main content

---

# 45. Premium SaaS Quality Checklist

Before accepting a design:

### Brand
- [ ] Looks unmistakably like idoconverter
- [ ] Feels professional and premium
- [ ] Does not resemble a generic converter directory

### Color
- [ ] Uses approved cream background
- [ ] Uses deep forest green
- [ ] Uses near-black primary actions
- [ ] Uses yellow sparingly
- [ ] No arbitrary colors

### Typography
- [ ] Inter is the UI font
- [ ] Playfair Display is only italic emphasis
- [ ] Heading hierarchy is clear
- [ ] Text remains readable on mobile

### Layout
- [ ] Strong whitespace
- [ ] Consistent 4px spacing system
- [ ] Consistent card radius
- [ ] Subtle shadows
- [ ] Clear alignment

### Homepage
- [ ] Hero communicates browser-local privacy
- [ ] JSON PII Masker product preview is prominent
- [ ] Six professions are represented
- [ ] Trust strip exists
- [ ] Featured tool section exists
- [ ] How It Works exists
- [ ] Pricing is in the middle
- [ ] Pricing is clearly Phase 4 / planned
- [ ] Why People Use idoconverter exists
- [ ] Testimonials exist or are clearly placeholders
- [ ] FAQ exists
- [ ] Final CTA is immediately before footer
- [ ] Footer is deep forest green

### Visual quality
- [ ] No leaves
- [ ] No botanical imagery
- [ ] No generic blobs
- [ ] No excessive gradients
- [ ] No emoji bullets
- [ ] No random decoration
- [ ] Product UI is believable
- [ ] Visual hierarchy is calm and premium

### Responsive
- [ ] 360px works
- [ ] No horizontal overflow
- [ ] Buttons remain usable
- [ ] Cards stack correctly
- [ ] Footer remains readable

### Accessibility
- [ ] Keyboard usable
- [ ] Focus states visible
- [ ] Contrast acceptable
- [ ] Semantic structure correct

---

# 46. Design Principle

The final design should communicate:

> **This is a serious, beautifully designed tool I can trust with my work.**

The premium feeling must come from:

```text
Typography
+
Spacing
+
Product UI
+
Hierarchy
+
Color discipline
+
Consistency
+
Useful interaction
```

Not from:

```text
Random decoration
+
Large gradients
+
Stock imagery
+
Artificial 3D elements
+
Unrelated visual metaphors
```

The interface should always feel like **idoconverter**, not like a generic SaaS template.
