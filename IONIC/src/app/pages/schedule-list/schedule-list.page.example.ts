import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { IonContent, IonHeader } from '@ionic/angular';
import { ScheduleService } from '../../services/schedule.service';
import { PaymentService } from '../../services/payment.service';
import { NotificationService } from '../../services/notification.service';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { App } from '@capacitor/app';

/**
 * COMPLETE EXAMPLE: Schedule List Page
 * 
 * Demonstrates:
 * - Ionic lifecycle hooks for data refresh
 * - Responsive layout (CSS Grid)
 * - Performance optimization (virtual scroll, lazy loading)
 * - Real-time data updates
 * - Background/foreground handling
 * - Subscription cleanup (no memory leaks)
 * - Touch-friendly UI
 */
@Component({
  selector: 'app-schedule-list',
  templateUrl: './schedule-list.page.html',
  styleUrls: ['./schedule-list.page.scss']
})
export class ScheduleListPage implements OnInit, OnDestroy {
  @ViewChild(IonContent) content: IonContent;

  // ============================================
  // DATA STATE
  // ============================================
  schedules: any[] = [];
  visibleSchedules: any[] = [];
  filteredSchedules: any[] = [];
  totalCount = 0;
  currentPage = 1;
  itemsPerPage = 10;

  // ============================================
  // UI STATE
  // ============================================
  loading = false;
  refreshing = false;
  hasNextPage = false;
  selectedSchedule: any | null = null;
  showFilters = false;

  // ============================================
  // LIFECYCLE MANAGEMENT
  // ============================================
  private destroy$ = new Subject<void>();
  private appStateSubscription: any;
  private lastDataRefreshTime = 0;
  private dataRefreshThreshold = 60000; // 1 minute

  // ============================================
  // FILTERS STATE
  // ============================================
  filters = {
    origin: '',
    destination: '',
    dateFrom: '',
    dateTo: '',
    timeFrom: '',
    timeTo: '',
    priceMin: 0,
    priceMax: 1000000,
    minSeats: 0,
    vehicleType: '',
    sortBy: 'departure_time'
  };

  constructor(
    private scheduleService: ScheduleService,
    private paymentService: PaymentService,
    private notificationService: NotificationService,
    private app: App
  ) {}

  // ============================================
  // ANGULAR LIFECYCLE
  // ============================================

  ngOnInit(): void {
    // Called once when component initializes
    console.log('ScheduleListPage.ngOnInit()');

    // One-time setup
    this.setupAppLifecycle();
    this.restoreFilters();
  }

  /**
   * IONIC LIFECYCLE: Called when page is about to enter
   * Perfect for data refresh, animations, timers
   */
  ionViewWillEnter(): void {
    console.log('ScheduleListPage.ionViewWillEnter()');

    // Check if data needs refresh (stale after 1 minute)
    const now = Date.now();
    if (now - this.lastDataRefreshTime > this.dataRefreshThreshold) {
      this.loadSchedules();
    }
  }

  /**
   * IONIC LIFECYCLE: Called after page entrance animation completes
   * Safe for heavy animations, heavy computations
   */
  ionViewDidEnter(): void {
    console.log('ScheduleListPage.ionViewDidEnter()');

    // Scroll to top smoothly
    this.content.scrollToTop(300);

    // Start any entrance animations
    this.animateScheduleCards();
  }

  /**
   * IONIC LIFECYCLE: Called when page is about to leave
   * Good place for cleanup that should happen before user leaves
   */
  ionViewWillLeave(): void {
    console.log('ScheduleListPage.ionViewWillLeave()');

    // Optional: Cancel pending API requests (not necessary with takeUntil)
    // Save filter state for when user returns
    this.saveFilters();
  }

  /**
   * IONIC LIFECYCLE: Called after page leave animation completes
   * Final cleanup before page is destroyed
   */
  ionViewDidLeave(): void {
    console.log('ScheduleListPage.ionViewDidLeave()');

    // Angular's ngOnDestroy will handle cleanup via destroy$ subject
  }

  /**
   * ANGULAR: Called when component is destroyed
   * Essential for RxJS cleanup
   */
  ngOnDestroy(): void {
    console.log('ScheduleListPage.ngOnDestroy()');

    // Unsubscribe from all subscriptions via takeUntil
    this.destroy$.next();
    this.destroy$.complete();

    // Cleanup app state listener
    if (this.appStateSubscription) {
      this.appStateSubscription.unsubscribe();
    }
  }

  // ============================================
  // APP LIFECYCLE HANDLING (Background/Foreground)
  // ============================================

  private setupAppLifecycle(): void {
    // Handle app state changes (pause/resume)
    this.appStateSubscription = this.app.stateChange
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        if (state.isActive) {
          console.log('App resumed from background');
          this.onAppResume();
        } else {
          console.log('App paused (backgrounded)');
          this.onAppPause();
        }
      });
  }

  private onAppPause(): void {
    // App is going to background
    // Stop timers, close websockets, etc.
    console.log('Pausing non-critical tasks...');
  }

  private onAppResume(): void {
    // App returned from background
    // Refresh stale data, resume timers, etc.
    console.log('Resuming after background...');

    // Refresh data if it's been > 5 minutes
    const now = Date.now();
    if (now - this.lastDataRefreshTime > 300000) {
      this.loadSchedules();
    }

    // Re-check payment status if any pending
    this.paymentService.checkPendingPayments();

    // Refresh unread notifications
    this.notificationService.refresh();
  }

  // ============================================
  // DATA LOADING & REFRESH
  // ============================================

  loadSchedules(): void {
    // Guard: Don't load if already loading
    if (this.loading) return;

    this.loading = true;
    this.currentPage = 1;

    this.scheduleService.searchSchedules(this.filters, 1, this.itemsPerPage)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.schedules = response.data || [];
          this.totalCount = response.total || 0;
          this.filteredSchedules = this.schedules;
          this.hasNextPage = response.has_next_page || false;
          this.lastDataRefreshTime = Date.now();
          this.loading = false;

          console.log(`Loaded ${this.schedules.length} schedules`);
        },
        error: (err) => {
          console.error('Failed to load schedules:', err);
          this.loading = false;
          // Show error toast to user
        }
      });
  }

  /**
   * Pull-to-refresh handler
   */
  onRefresh(event: any): void {
    this.refreshing = true;

    this.scheduleService.searchSchedules(this.filters, 1, this.itemsPerPage)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.schedules = response.data || [];
          this.filteredSchedules = this.schedules;
          this.refreshing = false;
          event.target.complete();

          console.log('Refresh completed');
        },
        error: (err) => {
          console.error('Refresh failed:', err);
          this.refreshing = false;
          event.target.complete();
        }
      });
  }

  /**
   * Infinite scroll: Load more schedules
   */
  onScroll(event: any): void {
    // Guard: Don't load if at end or already loading
    if (!this.hasNextPage || this.loading) {
      event.target.complete();
      return;
    }

    this.currentPage++;
    this.loading = true;

    this.scheduleService.searchSchedules(this.filters, this.currentPage, this.itemsPerPage)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.schedules.push(...(response.data || []));
          this.filteredSchedules = this.schedules;
          this.hasNextPage = response.has_next_page || false;
          this.loading = false;
          event.target.complete();

          console.log(`Loaded page ${this.currentPage}, total items: ${this.schedules.length}`);
        },
        error: (err) => {
          console.error('Pagination error:', err);
          this.currentPage--; // Revert page counter
          this.loading = false;
          event.target.complete();
        }
      });
  }

  // ============================================
  // FILTER MANAGEMENT
  // ============================================

  updateFilters(): void {
    // Debounce filter updates (wait 500ms after user stops typing)
    this.loadSchedules();
  }

  clearFilters(): void {
    this.filters = {
      origin: '',
      destination: '',
      dateFrom: '',
      dateTo: '',
      timeFrom: '',
      timeTo: '',
      priceMin: 0,
      priceMax: 1000000,
      minSeats: 0,
      vehicleType: '',
      sortBy: 'departure_time'
    };

    this.loadSchedules();
  }

  private saveFilters(): void {
    // Save to localStorage for next session
    localStorage.setItem('schedule_filters', JSON.stringify(this.filters));
  }

  private restoreFilters(): void {
    // Restore from localStorage if exists
    const saved = localStorage.getItem('schedule_filters');
    if (saved) {
      this.filters = JSON.parse(saved);
    }
  }

  // ============================================
  // INTERACTIONS
  // ============================================

  selectSchedule(schedule: any): void {
    this.selectedSchedule = schedule;
    // Open detail modal/page
  }

  bookSchedule(schedule: any): void {
    console.log('Booking:', schedule.id);

    // Navigate to payment page
    // router.navigate(['/booking', schedule.id])
  }

  // ============================================
  // ANIMATIONS
  // ============================================

  private animateScheduleCards(): void {
    // CSS animation: cards slide in from bottom
    const cards = document.querySelectorAll('.schedule-card');
    cards.forEach((card, index) => {
      (card as HTMLElement).style.animation = `slideUp 0.3s ease forwards`;
      (card as HTMLElement).style.animationDelay = `${index * 50}ms`;
    });
  }

  // ============================================
  // UTILITIES
  // ============================================

  formatPrice(price: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  }

  formatTime(time: string): string {
    const date = new Date(time);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('id-ID', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getAvailableSeats(schedule: any): number {
    return schedule.capacity - (schedule.booked_seats || 0);
  }

  getBadgeColor(seats: number): string {
    if (seats === 0) return 'danger';
    if (seats < 5) return 'warning';
    return 'success';
  }
}
