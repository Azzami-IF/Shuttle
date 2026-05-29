# Responsive UI/UX Improvements - CSS Toolkit

This file provides CSS patterns, utilities, and components for implementing responsive, accessible UI across all screen sizes.

## 1. Responsive Typography

```scss
// Base typography scale
// Desktop → Tablet → Mobile

// Headlines
h1 {
  font-size: 2.5rem;
  line-height: 1.2;

  @media (max-width: 1024px) {
    font-size: 2rem;
  }

  @media (max-width: 640px) {
    font-size: 1.75rem;
  }
}

h2 {
  font-size: 2rem;

  @media (max-width: 1024px) {
    font-size: 1.5rem;
  }

  @media (max-width: 640px) {
    font-size: 1.25rem;
  }
}

h3 {
  font-size: 1.5rem;

  @media (max-width: 1024px) {
    font-size: 1.25rem;
  }

  @media (max-width: 640px) {
    font-size: 1.1rem;
  }
}

// Body text
body, p {
  font-size: 1rem;
  line-height: 1.6;

  @media (max-width: 640px) {
    font-size: 0.95rem;
  }
}

// Small text
small {
  font-size: 0.875rem;

  @media (max-width: 640px) {
    font-size: 0.8rem;
  }
}
```

## 2. Responsive Spacing System

```scss
// Spacing utilities (rem-based for better scaling)
// Used consistently across all components

$spacing: (
  xs: 0.25rem,   // 4px
  sm: 0.5rem,    // 8px
  md: 1rem,      // 16px
  lg: 1.5rem,    // 24px
  xl: 2rem,      // 32px
  2xl: 2.5rem,   // 40px
  3xl: 3rem      // 48px
);

// Responsive padding
.padding {
  &-responsive {
    padding: map-get($spacing, xl);

    @media (max-width: 640px) {
      padding: map-get($spacing, lg);
    }
  }

  &-responsive-lg {
    padding: map-get($spacing, 2xl);

    @media (max-width: 1024px) {
      padding: map-get($spacing, xl);
    }

    @media (max-width: 640px) {
      padding: map-get($spacing, lg);
    }
  }
}

// Responsive gap
.gap {
  &-responsive {
    gap: map-get($spacing, lg);

    @media (max-width: 640px) {
      gap: map-get($spacing, md);
    }
  }
}
```

## 3. Flexible Grid Layouts

```scss
// 1. CSS Grid - Desktop focus
.grid-layout {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;

  // Explicit breakpoints
  @media (max-width: 1280px) {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    padding: 1rem;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    padding: 0.75rem;
  }
}

// 2. Flexbox - Flexible layouts
.flex-layout {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 0.75rem;
  }
}

// 3. Multi-column layout
.multi-column {
  columns: 3;
  column-gap: 2rem;

  @media (max-width: 1024px) {
    columns: 2;
    column-gap: 1.5rem;
  }

  @media (max-width: 640px) {
    columns: 1;
  }
}
```

## 4. Touch-Friendly Interactive Elements

```scss
// Minimum touch target size: 44x44px
.btn-responsive {
  min-width: 44px;
  min-height: 44px;
  padding: 0.75rem 1.25rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  white-space: nowrap;

  // Enhanced touch feedback
  &:active {
    transform: scale(0.95);
    opacity: 0.9;
  }

  // Mobile optimizations
  @media (max-width: 640px) {
    min-width: 48px;
    min-height: 48px;
    padding: 0.875rem 1.5rem;
    font-size: 1.05rem;

    // Increase gap between buttons on mobile
    margin: 0.5rem;
  }
}

// Form inputs - must be 44px+ on mobile
.input-responsive {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--ion-color-step-300);
  border-radius: 0.5rem;
  font-size: 1rem;
  line-height: 1.5;
  min-height: 44px;

  @media (max-width: 640px) {
    padding: 0.875rem 1rem;
    min-height: 48px;
    font-size: 1.05rem;
  }

  &:focus {
    outline: 2px solid var(--ion-color-primary);
    outline-offset: 2px;
  }
}
```

## 5. Adaptive Navigation

```scss
// Desktop: Horizontal sidebar
// Mobile: Bottom tab bar
.navigation {
  display: flex;
  flex-direction: row;
  gap: 2rem;
  position: relative;
  padding: 0 2rem;

  @media (max-width: 768px) {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    flex-direction: row;
    gap: 0;
    padding: 0;
    background: var(--ion-background-color);
    border-top: 1px solid var(--ion-color-step-200);
    z-index: 100;
    height: 60px;

    // Adjust content padding to avoid nav overlap
    body {
      padding-bottom: 60px;
    }
  }
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;

  @media (max-width: 768px) {
    flex: 1;
    justify-content: center;
    gap: 0.25rem;
    flex-direction: column;
    padding: 0.5rem;
    font-size: 0.8rem;
    border-radius: 0;

    .icon {
      font-size: 1.5rem;
    }
  }
}
```

## 6. Modal & Overlay Improvements

```scss
// Modal that adapts to screen size
.modal-adaptive {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 1rem;
  z-index: 1000;

  @media (min-width: 768px) {
    align-items: center;
  }

  .modal-content {
    background: var(--ion-background-color);
    border-radius: 1rem 1rem 0 0;
    padding: 1.5rem;
    max-width: 600px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    animation: slideUp 0.3s ease;

    @media (min-width: 768px) {
      border-radius: 1rem;
      max-height: 80vh;
    }

    @media (max-width: 480px) {
      padding: 1rem;
      border-radius: 0.75rem;
    }
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
```

## 7. Card Components - Responsive

```scss
.card-responsive {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 0.75rem;
  background: var(--ion-color-step-50);
  border: 1px solid var(--ion-color-step-200);
  transition: all 0.2s ease;
  break-inside: avoid; // For multi-column layouts

  @media (max-width: 640px) {
    padding: 1rem;
    gap: 0.75rem;
    border-radius: 0.5rem;

    // Ensure images scale properly
    img {
      border-radius: 0.5rem;
      max-height: 200px;
      object-fit: cover;
    }
  }

  &:active {
    transform: scale(0.98);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

// Card with image and text
.card-with-image {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 100px 1fr;
    gap: 0.75rem;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;

    img {
      width: 100%;
      height: auto;
    }
  }
}
```

## 8. Glassmorphism - Performance Optimized

```scss
.glass-effect {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  padding: 1.5rem;

  // Disable blur on mobile for performance
  @media (max-width: 640px) {
    backdrop-filter: blur(5px);
    padding: 1rem;
  }

  // Fallback for unsupported browsers
  @supports not (backdrop-filter: blur(10px)) {
    background: rgba(255, 255, 255, 0.9);
  }

  // Dark mode
  @media (prefers-color-scheme: dark) {
    background: rgba(15, 23, 42, 0.15);
    border-color: rgba(148, 163, 184, 0.2);
  }
}
```

## 9. Dark Mode Responsive

```scss
// Theme-aware colors
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --text-primary: #000000;
  --text-secondary: #666666;
  --border-color: #e0e0e0;

  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.15);
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #0f172a;
    --bg-secondary: #1e293b;
    --text-primary: #ffffff;
    --text-secondary: #cbd5e1;
    --border-color: #334155;

    --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.3);
    --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.5);
    --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.7);
  }
}

// Use variables everywhere
body {
  background: var(--bg-primary);
  color: var(--text-primary);
}

.card {
  background: var(--bg-secondary);
  border-color: var(--border-color);
  box-shadow: var(--shadow-md);
}
```

## 10. Performance Checklist

```scss
// ✅ DO: Use CSS Grid/Flexbox (performant)
.layout {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

// ✅ DO: Use transforms for animations (GPU-accelerated)
.animated {
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
}

// ✅ DO: Use CSS containment for complex layouts
.container {
  contain: layout style paint;
}

// ❌ DON'T: Use absolute positioning excessively
// ❌ DON'T: Animate width/height (use transform instead)
// ❌ DON'T: Use box-shadow on hover without transition
```

## 11. Accessibility Considerations

```scss
// Focus indicators for keyboard navigation
button:focus,
a:focus {
  outline: 2px solid var(--ion-color-primary);
  outline-offset: 2px;
}

// Better contrast in dark mode
@media (prefers-color-scheme: dark) {
  button:focus {
    outline-color: var(--ion-color-primary-tint);
  }
}

// Respect prefers-reduced-motion
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}

// Sufficient color contrast
// Text should have min 4.5:1 ratio
.text-primary {
  color: var(--text-primary);
  background: var(--bg-primary);
}
```

## 12. Usage Examples

### Example 1: Responsive Schedule List

```html
<div class="schedule-list">
  <div class="grid-layout">
    <div class="card-responsive" *ngFor="let schedule of schedules">
      <div class="card-header">
        <h3>{{ schedule.route }}</h3>
        <span class="badge">{{ schedule.availableSeats }} seats</span>
      </div>
      <div class="card-body">
        <p class="departure">{{ schedule.departureTime }}</p>
        <p class="price">{{ schedule.price | currency }}</p>
      </div>
      <button class="btn-responsive">Book Now</button>
    </div>
  </div>
</div>
```

### Example 2: Responsive Settings Form

```html
<form class="settings-form">
  <div class="flex-layout">
    <div class="form-group">
      <label>Full Name</label>
      <input type="text" class="input-responsive">
    </div>
    <div class="form-group">
      <label>Email</label>
      <input type="email" class="input-responsive">
    </div>
  </div>

  <div class="form-group">
    <label>Theme</label>
    <select class="input-responsive">
      <option>Light</option>
      <option>Dark</option>
      <option>System</option>
    </select>
  </div>

  <button type="submit" class="btn-responsive">Save</button>
</form>
```

## Summary

- ✅ Use rem units for scalable sizing
- ✅ Mobile-first approach: start with mobile, add complexity for larger screens
- ✅ Test on actual devices (not just browser DevTools)
- ✅ Maintain 44px+ touch targets on mobile
- ✅ Use CSS Grid/Flexbox for layouts
- ✅ Optimize performance on mobile
- ✅ Support dark mode
- ✅ Ensure sufficient color contrast
- ✅ Provide keyboard navigation
- ✅ Minimize font size changes between breakpoints
