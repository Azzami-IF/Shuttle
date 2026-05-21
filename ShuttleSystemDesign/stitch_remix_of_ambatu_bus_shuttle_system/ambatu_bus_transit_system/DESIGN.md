---
name: Ambatu Bus Transit System
colors:
  surface: '#f7f9fc'
  surface-dim: '#d8dadd'
  surface-bright: '#f7f9fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f7'
  surface-container: '#eceef1'
  surface-container-high: '#e6e8eb'
  surface-container-highest: '#e0e3e6'
  on-surface: '#191c1e'
  on-surface-variant: '#434652'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f4'
  outline: '#747683'
  outline-variant: '#c4c6d4'
  surface-tint: '#335ab4'
  primary: '#002f7e'
  on-primary: '#ffffff'
  primary-container: '#1a46a0'
  on-primary-container: '#a3baff'
  inverse-primary: '#b2c5ff'
  secondary: '#8c5000'
  on-secondary: '#ffffff'
  secondary-container: '#fe9400'
  on-secondary-container: '#633700'
  tertiary: '#745b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#d0a600'
  on-tertiary-container: '#4f3d00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2ff'
  primary-fixed-dim: '#b2c5ff'
  on-primary-fixed: '#001848'
  on-primary-fixed-variant: '#11419b'
  secondary-fixed: '#ffdcbf'
  secondary-fixed-dim: '#ffb874'
  on-secondary-fixed: '#2d1600'
  on-secondary-fixed-variant: '#6a3b00'
  tertiary-fixed: '#ffe08b'
  tertiary-fixed-dim: '#f1c100'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#584400'
  background: '#f7f9fc'
  on-background: '#191c1e'
  surface-variant: '#e0e3e6'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-bold:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-margin: 20px
  gutter: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
  section-padding: 32px
---

## Brand & Style

This design system is engineered for a modern, high-frequency shuttle application, prioritizing reliability, speed of information retrieval, and ease of use. The brand personality is **Professional, Dependable, and Vibrant**. It bridges the gap between traditional public infrastructure and a premium, tech-forward service.

The aesthetic follows a **Corporate / Modern** style with heavy influences from contemporary mobility apps. It utilizes high-contrast color pairings to guide the eye toward critical actions (like booking or QR scanning) while maintaining a clean, systematic foundation for schedules and data-dense route information. The interface relies on clear visual anchoring, generous whitespace to reduce cognitive load during travel, and a logical information hierarchy that mirrors the physical experience of transit.

## Colors

The palette is anchored by **Deep Transit Blue**, evoking a sense of institutional trust and authority. **Vibrant Orange** and **Safety Yellow** are utilized as high-visibility accents for primary call-to-actions, alerts, and loyalty indicators, mirroring the visual language of transportation signage.

A neutral scale of cool grays provides structure for secondary information. Status indicators are semantic:
- **Scheduled:** A neutral slate, representing a pending state.
- **Ongoing:** A bright blue, indicating active movement or live tracking.
- **Completed:** A clear green, signaling a successful journey.

## Typography

**Hanken Grotesk** is the sole typeface for the design system. Its sharp, contemporary geometry ensures legibility at small sizes (essential for ticket details and bus numbers) while appearing authoritative and modern in large display formats.

- **Display & Headlines:** Use Bold or SemiBold weights to establish clear sections and page titles.
- **Body:** Regular weight is used for all descriptive text and user inputs.
- **Labels:** Uppercase styling with increased letter spacing is recommended for "Scheduled/Ongoing" status chips to differentiate them from interactive text.

## Layout & Spacing

This design system employs a **Fluid Grid** model optimized for mobile-first interactions. 

- **Grid:** A 4-column grid for mobile and an 8-column grid for tablet/desktop. 
- **Margins:** A consistent 20px outer margin ensures content doesn't feel cramped against the bezel.
- **Rhythm:** An 8px base unit drives all spacing. Use `stack-md` (16px) for related elements within a card and `stack-lg` (24px) to separate distinct functional blocks.
- **Form Factors:** On mobile, components like the "Quick Book" card should span the full width minus margins. On larger screens, content is centered with a max-width of 720px to maintain readability.

## Elevation & Depth

Hierarchy is defined through **Tonal Layers** and **Ambient Shadows**.

1.  **Level 0 (Base):** The canvas background, typically white or very light gray.
2.  **Level 1 (Cards):** Elevated via a soft, diffused shadow (`y: 4, blur: 12, opacity: 0.05, color: #1A46A0`). Used for ticket cards, route summaries, and profiles.
3.  **Level 2 (Active Elements):** Primary buttons and interactive chips use a slightly tighter shadow to feel "pressable."
4.  **Level 3 (Overlays):** Modals and bottom sheets use a high-blur backdrop to focus the user on the task at hand.

Avoid harsh borders. Instead, use thin, low-contrast 1px strokes (`#E2E8F0`) to define boundaries between list items or input fields.

## Shapes

The shape language is **Rounded**, conveying friendliness and accessibility. 

- **Standard Elements:** Buttons and input fields use a `0.5rem` (8px) radius.
- **Container Elements:** Large cards and landing page banners use `rounded-lg` (16px) to create a soft, modern enclosure.
- **Status Chips:** Use a full "Pill" shape (32px+) to distinguish them from rectangular buttons.
- **Icon Backdrops:** Service icons (e.g., "Airport Shuttle," "Intercity") should be contained in rounded circles or high-radius squares to maintain consistency with the KAI Access inspiration.

## Components

### Buttons
- **Primary:** Deep Blue background with White text. Used for main actions like "Search Bus" or "Confirm Payment."
- **Secondary:** White background with Deep Blue border. Used for "Lihat Profile" or "Edit Search."
- **Accent:** Vibrant Orange background with White text. Reserved for high-priority or promotional actions.

### Status Indicators (Chips)
- **Scheduled:** Slate gray background with white text.
- **Ongoing:** Blue background with white text; include a subtle pulse animation for "Live" tracking.
- **Completed:** Emerald green background with white text.

### Input Fields
- Use a light gray background (`#F8FAFC`) with a subtle 1px border. 
- Placeholder text should be in a muted slate. 
- Active states are indicated by the primary Blue border.

### Cards
- Travel cards must display the Departure Time, Arrival Time, and Price prominently.
- Use a vertical divider between the origin and destination, inspired by transit maps.
- Group ticket info within a Level 1 elevated card.

### Navigation
- A fixed Bottom Navigation Bar featuring iconic representations of Home, Tickets, Promos, and Account. Use the Primary Blue for active states and a mid-gray for inactive states.