---
name: Serene Transit
colors:
  surface: '#f8faf5'
  surface-dim: '#d9dbd6'
  surface-bright: '#f8faf5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f0'
  surface-container: '#edeeea'
  surface-container-high: '#e7e9e4'
  surface-container-highest: '#e1e3df'
  on-surface: '#191c1a'
  on-surface-variant: '#434844'
  inverse-surface: '#2e312e'
  inverse-on-surface: '#f0f1ed'
  outline: '#737873'
  outline-variant: '#c3c8c2'
  surface-tint: '#516356'
  primary: '#18281e'
  on-primary: '#ffffff'
  primary-container: '#2d3e33'
  on-primary-container: '#96a99b'
  inverse-primary: '#b8cbbc'
  secondary: '#536349'
  on-secondary: '#ffffff'
  secondary-container: '#d3e5c5'
  on-secondary-container: '#57674d'
  tertiary: '#232525'
  on-tertiary: '#ffffff'
  tertiary-container: '#383b3b'
  on-tertiary-container: '#a3a5a4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d4e7d8'
  primary-fixed-dim: '#b8cbbc'
  on-primary-fixed: '#0e1f15'
  on-primary-fixed-variant: '#394b3f'
  secondary-fixed: '#d6e8c8'
  secondary-fixed-dim: '#baccad'
  on-secondary-fixed: '#111f0b'
  on-secondary-fixed-variant: '#3c4b33'
  tertiary-fixed: '#e1e3e2'
  tertiary-fixed-dim: '#c5c7c6'
  on-tertiary-fixed: '#191c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#f8faf5'
  on-background: '#191c1a'
  surface-variant: '#e1e3df'
typography:
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style

This design system is built for a transit ecosystem that prioritizes passenger well-being and operational clarity. The brand personality is professional, serene, and modern, moving away from the chaotic nature of public transport toward a sophisticated, "botanical" efficiency.

The design style is **Corporate Modern with a Minimalist lean**. It leverages significant whitespace (clean white surfaces) and a naturalistic color palette to evoke a sense of calm. Visual elements are balanced and precise, ensuring that complex transit data remains readable and stress-free for the end user.

## Colors

The color palette is derived from natural, ethereal garden tones to provide a calming influence within a high-utility environment.

- **Primary (Forest Green):** Used for navigation bars, primary action buttons, and critical status indications. It provides the "anchor" for the brand.
- **Secondary (Sage Green):** Used for accent elements, successful states, and secondary call-to-actions. It softens the interface.
- **Tertiary (Soft White):** The primary surface color. It is a warm, clean white that reduces eye strain compared to pure hex white.
- **Neutral:** A deep slate-grey used for body text and subtle borders to maintain high legibility without the harshness of pure black.

## Typography

The design system utilizes **Hanken Grotesk** exclusively to maintain a sharp, contemporary, and highly legible aesthetic. 

Headlines use a tighter letter-spacing and heavier weights to command authority on transit schedules and headers. Body text maintains a generous line height (1.5x) to ensure schedules and route information are easy to scan while in motion. Labels should be used for metadata like bus numbers, ETAs, and platform identifiers.

## Layout & Spacing

The layout follows a **Fluid Grid** model with a focus on generous "breathing room" to reinforce the serene brand promise.

- **Mobile:** 4-column grid with 16px side margins. Elements typically stack vertically.
- **Tablet:** 8-column grid with 24px margins.
- **Desktop:** 12-column grid with a maximum content width of 1440px. 

Spacing follows an 8px linear scale. Large components like transit cards or map modules should use 'md' (24px) padding to maintain a premium, airy feel.

## Elevation & Depth

To maintain the "Modern Serene" aesthetic, the design system avoids heavy shadows. 

Depth is achieved through **Tonal Layers** and **Soft Ambient Shadows**. Surfaces should appear as if they are resting lightly on top of one another. Shadows should use a very low opacity (5-8%) with a hint of the Forest Green primary color mixed into the shadow tint to keep the palette cohesive. High-priority modals may use a subtle backdrop blur (10px) to maintain context while focusing the user's attention.

## Shapes

The shape language is consistently **Rounded**, reflecting a friendly and approachable transit experience.

- **Standard Elements:** Buttons and input fields use a 0.5rem (8px) radius.
- **Containers:** Cards and large modal sheets use a 1rem (16px) radius.
- **Interactive Pill:** Search bars and status chips use the fully rounded "pill" style to differentiate them from static content containers.

## Components

### Buttons
Primary buttons use the Forest Green background with White text. Secondary buttons use a Sage Green ghost style (border only) or a light Sage Green tint with Forest Green text.

### Cards
Transit cards (containing route info) use a clean white surface with a subtle 1px border in a lightened neutral tone. They should not use heavy shadows unless hovered.

### Input Fields
Inputs should have a Sage Green border focus state. The background should be slightly off-white to distinguish from the page background.

### Chips & Tags
Used for "On Time," "Delayed," or "Express" markers. These should utilize the Sage Green palette with Forest Green text for high contrast and soft aesthetics.

### Progress & Map Elements
Transit lines on maps should use thick, rounded strokes. The Forest Green should be used for the user's current route, while Sage Green represents alternative options.