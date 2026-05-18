---
name: Mediterranean Heritage
colors:
  surface: '#faf9f5'
  surface-dim: '#dbdad6'
  surface-bright: '#faf9f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f4f0'
  surface-container: '#efeeea'
  surface-container-high: '#e9e8e4'
  surface-container-highest: '#e3e2df'
  on-surface: '#1b1c1a'
  on-surface-variant: '#594238'
  inverse-surface: '#2f312e'
  inverse-on-surface: '#f2f1ed'
  outline: '#8c7166'
  outline-variant: '#e0c0b2'
  surface-tint: '#a23f00'
  primary: '#9e3d00'
  on-primary: '#ffffff'
  primary-container: '#c64f00'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb595'
  secondary: '#4e6073'
  on-secondary: '#ffffff'
  secondary-container: '#cfe2f9'
  on-secondary-container: '#526478'
  tertiary: '#735c00'
  on-tertiary: '#ffffff'
  tertiary-container: '#cea700'
  on-tertiary-container: '#4e3e00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbcd'
  primary-fixed-dim: '#ffb595'
  on-primary-fixed: '#351000'
  on-primary-fixed-variant: '#7c2e00'
  secondary-fixed: '#d1e4fb'
  secondary-fixed-dim: '#b5c8df'
  on-secondary-fixed: '#091d2e'
  on-secondary-fixed-variant: '#36485b'
  tertiary-fixed: '#ffe084'
  tertiary-fixed-dim: '#eec209'
  on-tertiary-fixed: '#231b00'
  on-tertiary-fixed-variant: '#574500'
  background: '#faf9f5'
  on-background: '#1b1c1a'
  surface-variant: '#e3e2df'
typography:
  display-lg:
    fontFamily: Arimo
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Arimo
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Arimo
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Arimo
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Montserrat
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Montserrat
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Montserrat
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Montserrat
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-margin-mobile: 20px
  container-margin-desktop: 80px
  gutter: 16px
  section-gap: 64px
---

## Brand & Style
The design system embodies the warmth and sophistication of high-end Moroccan travel. It draws from a **Modern Minimalist** foundation with an **Architectural Precision** overlay, reminiscent of high-end design ateliers. The goal is to evoke a sense of "slow luxury"—calm, grounded, and deeply curated.

The aesthetic prioritizes high-quality environmental photography and intentional whitespace to allow the rich terracotta and navy accents to breathe. It avoids the cluttered "souk" aesthetic in favor of the serenity found in a private riad courtyard. Every interaction should feel effortless and premium, catering to a discerning traveler seeking cultural depth and contemporary comfort through a clean, modern lens.

## Colors
The palette is rooted in the natural materials of the Maghreb. 

- **Zellige Sand (#FDFCF8):** The primary surface color. It provides a warmer, more sophisticated base than pure white, reducing eye strain and mimicking lime-washed walls.
- **Atlas Earth (#D35400):** Used for primary actions, active states, and brand-heavy elements. It is the heat of the sun and the clay of the mountains.
- **Casablanca Night (#2C3E50):** Reserved for high-contrast typography and navigational elements. It provides the "anchor" for the light UI.
- **Sun-drenched Gold (#F1C40F):** An accent for highlights, ratings, and luxury indicators.
- **Support Tones:** Soft sage and muted clay are used for secondary information, tags, and subtle background variations in complex layouts.

## Typography
The typographic scale relies on the modern, architectural clarity of **Arimo** paired with the functional, geometric versatility of **Montserrat**.

- **Headlines:** Use Arimo for all major headings. Its clean, sans-serif lines provide a contemporary, structured feel to the PWA. Tighter letter spacing should be used for large display text.
- **Body:** Use Montserrat for all long-form text and interface labels. It ensures legibility on small mobile screens where elaborate styling might struggle.
- **Utility:** Labels and small metadata should use Montserrat Medium or SemiBold with a slight increase in letter spacing and uppercase styling to denote hierarchy without increasing size.

## Layout & Spacing
The layout follows a **Fluid Grid** model with a focus on generous internal padding. 

- **The 8px Square:** All spacing between elements must be a multiple of 8px.
- **Margins:** Use 20px side margins on mobile to ensure content doesn't feel cramped against the screen edge. On desktop, expand this to 80px+ to maintain the premium feel.
- **Vertical Rhythm:** Use significant vertical gaps (64px+) between sections to define clear content boundaries without the need for heavy dividers.
- **Alignment:** Center-align display typography for hero sections; use left-alignment for all functional and body content to ensure quick scanning.

## Elevation & Depth
Depth is created through **Tonal Layers** and **Ambient Shadows** rather than stark borders.

- **Soft Shadows:** Elements like cards and floating action buttons use a very soft, diffused shadow: `box-shadow: 0 12px 32px rgba(44, 62, 80, 0.08)`. The shadow color is tinted with *Casablanca Night* to keep it natural and integrated.
- **Z-Axis:** 
    - **Level 0 (Surface):** Zellige Sand background.
    - **Level 1 (Cards):** Pure white (#FFFFFF) with the soft ambient shadow.
    - **Level 2 (Overlays/Modals):** Pure white with a 20% backdrop blur on the surface below.
- **Dividers:** When required, use a 0.5px line in a 10% opacity version of Casablanca Night. For decorative dividers, use a faint, repeating geometric Zellige line-art pattern.

## Shapes
The shape language is organic and soft, mirroring the arched doorways and smoothed tadelakt plasters of Moroccan architecture.

- **Standard Elements:** Buttons, inputs, and small cards use a 16px (`1rem`) radius.
- **Large Containers:** Hero images and main content sections use a 24px (`1.5rem`) radius.
- **Icons:** Icons should feature rounded caps and joins to match the soft UI ethos. Avoid sharp 90-degree corners wherever possible.

## Components
- **Buttons:** Primary buttons are Atlas Earth with white Montserrat SemiBold text. Secondary buttons are Casablanca Night outlines with 1px weight. All buttons use 16px rounding and a height of 56px for touch-friendliness.
- **Input Fields:** Use a subtle "Sand" fill slightly darker than the background (#F5F2E9) with no border. On focus, transition to a 1px Atlas Earth bottom-border.
- **Cards:** White backgrounds with 24px corner radius. Image-to-content ratio should be 1:1 or 2:1. Typography inside cards should be spacious.
- **Chips/Tags:** Use the Sage and Clay support colors at 15% opacity with 100px (pill) rounding. Text should match the full-strength color for accessibility.
- **Iconography:** Use 1.5pt or 2pt stroke weights. Icons are never filled; they remain minimalist and "airy."
- **Imagery:** All photos must have a consistent warm temperature. Use CSS `object-fit: cover` with large radii. Every major scroll section should be anchored by one high-impact image.
- **Navigation:** A bottom navigation bar on mobile using Casablanca Night for icons. The active state is indicated by a small Atlas Earth dot below the icon rather than a background highlight.