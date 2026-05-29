# Ionic Lifecycle & Responsive UI/UX - Implementation Guide

## 1. Ionic Lifecycle Hooks Overview

Ionic provides several lifecycle hooks that allow you to manage component behavior as users navigate through your app. These are critical for:
- Real-time data refresh
- Cleaning up subscriptions
- Managing timers and background tasks
- Optimizing performance

### Lifecycle Hook Execution Order:

```
Page 1                                  Page 2
↓
ionViewWillEnter() → enter transition → ionViewWillEnter()
         ↓
    component ready              ionViewDidEnter()
         ↓
ionViewWillLeave() ← leave transition ← ionViewWillLeave()
         ↓
  cleanup happens                ionViewDidLeave()
```

## 2. Best Practices for Real-Time Data Updates

### Problem: App feels stale when switching between pages
- Solution: Use `ionViewWillEnter()` to refresh data
- Prevents unnecessary API calls on every view

### Example Implementation:

```typescript
export class ScheduleListPage implements OnInit, OnDestroy {
  schedules: any[] = [];
  private destroy$ = new Subject<void>();

  constructor(private api: ApiService) {}

  ngOnInit() {
    // One-time initialization
    this.initializeFilters();
  }

  ionViewWillEnter() {
    // Called every time user navigates to this page
    // Perfect for refreshing data
    this.loadSchedules();
  }

  ionViewWillLeave() {
    // Cleanup before leaving page
    // Cancel pending requests if needed
  }

  ionViewDidLeave() {
    // Page has fully left - safe to clean up subscriptions
    this.destroy$.next();
  }

  loadSchedules() {
    this.api.get('schedules')
      .pipe(takeUntil(this.destroy$))
      .subscribe(schedules => {
        this.schedules = schedules;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

## 3. Managing Background Tasks & Timers

When the app goes to background, timers and long-running tasks should be paused.

### Payment Timer Example:

```typescript
export class PaymentPage implements OnInit, OnDestroy {
  private timerSubscription: Subscription | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private paymentState: PaymentStateService,
    private appState: App // Capacitor
  ) {}

  ngOnInit() {
    // Handle app lifecycle
    this.appState.stateChange
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        if (state.isActive) {
          // App came back from background
          this.onAppResume();
        } else {
          // App went to background
          this.onAppPause();
        }
      });
  }

  ionViewWillEnter() {
    // Start countdown timer
    this.startCountdown();
  }

  ionViewWillLeave() {
    // Pause timer if leaving page
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  private startCountdown() {
    this.timerSubscription = interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // Update timer display
      });
  }

  private onAppPause() {
    // App backgrounded - pause timers
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  private onAppResume() {
    // App resumed from background
    // Restore state and restart timers
    this.paymentState.restorePaymentState(this.bookingId)
      .then(state => {
        if (state && !this.paymentState.isExpired(state)) {
          this.startCountdown();
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

## 4. Optimizing Page Transitions

Use `ionViewDidEnter` and `ionViewDidLeave` for animations and transitions:

```typescript
export class BookingDetailPage implements OnInit {
  @ViewChild('header') header: IonHeader;

  ionViewDidEnter() {
    // Animation has completed - safe to run animations
    this.animateHeader();
  }

  ionViewWillLeave() {
    // About to leave - stop any running animations
    this.stopAnimations();
  }

  private animateHeader() {
    // Run smooth entrance animation
  }

  private stopAnimations() {
    // Cancel ongoing animations
  }
}
```

## 5. Preventing Memory Leaks

Always unsubscribe from Observables when a page leaves:

```typescript
export class TripTrackingPage implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private locationUpdates$ = this.tracking.trackingUpdates$;

  constructor(private tracking: TrackingService) {}

  ionViewWillEnter() {
    this.subscribeToLocationUpdates();
  }

  ionViewWillLeave() {
    // RxJS will automatically unsubscribe via takeUntil
    // But you can also manually handle cleanup
  }

  private subscribeToLocationUpdates() {
    this.locationUpdates$
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(location => {
        this.updateMap(location);
      });
  }

  ngOnDestroy() {
    // This completes the destroy$ subject, triggering all takeUntil()
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

## 6. Responsive Layout with CSS Grid & Flexbox

### Mobile-First Approach:

```scss
// Schedule list responsive layout
.schedule-cards {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;

  // Tablet (640px+)
  @media (min-width: 640px) {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }

  // Desktop (1024px+)
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
}

.schedule-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  border-radius: 0.75rem;
  background: var(--ion-color-step-50);
  transition: transform 0.2s, box-shadow 0.2s;

  &:active {
    transform: scale(0.98);
  }

  // Ensure text doesn't overflow on small screens
  @media (max-width: 480px) {
    padding: 0.75rem;
    gap: 0.75rem;

    .route-details {
      font-size: 0.875rem;
    }
  }
}
```

### Ionic Grid System:

```html
<!-- Responsive grid using Ionic components -->
<ion-grid>
  <ion-row>
    <ion-col size="12" size-md="6" size-lg="4">
      <div class="schedule-card">
        <!-- Card content -->
      </div>
    </ion-col>
    <ion-col size="12" size-md="6" size-lg="4">
      <div class="schedule-card">
        <!-- Card content -->
      </div>
    </ion-col>
    <ion-col size="12" size-md="6" size-lg="4">
      <div class="schedule-card">
        <!-- Card content -->
      </div>
    </ion-col>
  </ion-row>
</ion-grid>
```

## 7. Touch-Friendly UI

Ensure buttons and interactive elements are at least 44px × 44px:

```scss
.interactive-btn {
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  transition: background 0.2s ease;

  // Add touch feedback
  &:active {
    opacity: 0.7;
  }

  // Extra padding on small screens
  @media (max-width: 480px) {
    padding: 0.75rem 1rem;
    min-width: auto;
  }
}
```

## 8. Glassmorphism with Responsive Design

```scss
.glass-effect {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  padding: 1.5rem;

  // Reduce blur on mobile for better performance
  @media (max-width: 768px) {
    backdrop-filter: blur(5px);
    padding: 1rem;
  }

  // Fallback for browsers that don't support backdrop-filter
  @supports not (backdrop-filter: blur(10px)) {
    background: rgba(255, 255, 255, 0.9);
  }
}
```

## 9. Performance Optimization Tips

### Image Optimization:
```html
<!-- Use responsive images -->
<img 
  [src]="getImageUrl(vehicle, 'mobile')"
  [srcset]="getImageSrcSet(vehicle)"
  alt="Vehicle image"
  loading="lazy">
```

### Lazy Loading Content:
```typescript
export class ScheduleListPage {
  items: any[] = [];
  visibleItems: any[] = [];
  private itemsPerPage = 10;

  ionViewWillEnter() {
    this.loadSchedules();
    this.loadMoreItems();
  }

  onScroll(event: IonInfiniteScroll) {
    this.loadMoreItems();
    event.target.complete();
  }

  private loadMoreItems() {
    const start = this.visibleItems.length;
    const end = start + this.itemsPerPage;
    this.visibleItems = this.items.slice(0, end);
  }
}
```

### Virtual Scrolling for Large Lists:
```html
<ion-virtual-scroll [items]="largeList" approxItemHeight="100px">
  <div class="schedule-card" *virtualItem="let item">
    <!-- Card content -->
  </div>
</ion-virtual-scroll>
```

## 10. Safeguards Against Common Issues

### Problem: Blank screen after navigation
```typescript
// ✅ DO: Always initialize data in ionViewWillEnter
ionViewWillEnter() {
  this.loadData();
}

// ❌ DON'T: Only in ngOnInit (only called once)
ngOnInit() {
  this.loadData(); // Might be stale after navigating back
}
```

### Problem: Double data loads on app resume
```typescript
// ✅ DO: Track if data is being loaded
private isLoading = false;

ionViewWillEnter() {
  if (!this.isLoading && this.shouldRefresh()) {
    this.loadData();
  }
}

// ❌ DON'T: Load without checking
ionViewWillEnter() {
  this.loadData(); // Loads every time, even if already loaded
}
```

### Problem: Timers continue after leaving page
```typescript
// ✅ DO: Always cleanup subscriptions
private destroy$ = new Subject<void>();

private startTimer() {
  interval(1000)
    .pipe(takeUntil(this.destroy$)) // Stops on destroy
    .subscribe(() => {
      // Update UI
    });
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}

// ❌ DON'T: Forget cleanup
private startTimer() {
  interval(1000).subscribe(() => {
    // Timer continues even after page leaves!
  });
}
```

## Summary Checklist

- [ ] Use `ionViewWillEnter()` for data refresh
- [ ] Implement `ngOnDestroy()` with `takeUntil()` for subscriptions
- [ ] Handle app lifecycle (pause/resume)
- [ ] Use mobile-first CSS with media queries
- [ ] Ensure interactive elements are 44px minimum
- [ ] Test on actual devices (not just browser)
- [ ] Use Ionic's built-in components for consistency
- [ ] Implement virtual scrolling for large lists
- [ ] Optimize images for different screen sizes
- [ ] Test dark mode on multiple devices
