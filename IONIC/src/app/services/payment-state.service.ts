import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval, Subscription, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { Storage } from '@ionic/storage-angular';

export interface PaymentState {
  bookingId: number;
  paymentIntentId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'expired' | 'cancelled';
  amount: number;
  currency: string;
  createdAt: number;
  expiresAt: number;
  timeRemaining: number;
  clientSecret?: string;
  errorMessage?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentStateService {
  private readonly PAYMENT_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
  private readonly STORAGE_KEY = 'payment_state_';
  private readonly POLL_INTERVAL = 1000; // 1 second

  private paymentStateSubject = new BehaviorSubject<PaymentState | null>(null);
  paymentState$ = this.paymentStateSubject.asObservable();

  private destroy$ = new Subject<void>();
  private timerSubscription: Subscription | null = null;
  private pollSubscription: Subscription | null = null;

  constructor(private storage: Storage) {}

  /**
   * Initialize payment state when user starts payment process
   */
  async initializePayment(
    bookingId: number,
    paymentIntentId: string,
    amount: number,
    currency: string = 'IDR',
    clientSecret?: string
  ): Promise<PaymentState> {
    const now = Date.now();
    const expiresAt = now + this.PAYMENT_TIMEOUT_MS;

    const state: PaymentState = {
      bookingId,
      paymentIntentId,
      status: 'pending',
      amount,
      currency,
      createdAt: now,
      expiresAt,
      timeRemaining: this.PAYMENT_TIMEOUT_MS,
      clientSecret,
    };

    // Save to local storage for persistence
    await this.storage.set(this.STORAGE_KEY + bookingId, state);

    // Update subject
    this.paymentStateSubject.next(state);

    // Start countdown timer
    this.startCountdownTimer(bookingId);

    // Start polling for payment status updates
    this.startPollingForStatus(bookingId);

    return state;
  }

  /**
   * Restore payment state from storage (if app was background'd)
   */
  async restorePaymentState(bookingId: number): Promise<PaymentState | null> {
    const state = await this.storage.get(this.STORAGE_KEY + bookingId);

    if (!state) {
      return null;
    }

    // Check if payment has already expired
    const now = Date.now();
    if (now > state.expiresAt) {
      state.status = 'expired';
      await this.clearPaymentState(bookingId);
      this.paymentStateSubject.next(state);
      return state;
    }

    // Restore state and resume timers
    this.paymentStateSubject.next(state);
    this.startCountdownTimer(bookingId);
    this.startPollingForStatus(bookingId);

    return state;
  }

  /**
   * Update payment status (e.g., when payment succeeds)
   */
  async updatePaymentStatus(
    bookingId: number,
    status: PaymentState['status'],
    errorMessage?: string
  ): Promise<PaymentState | null> {
    let state = this.paymentStateSubject.value;

    if (!state || state.bookingId !== bookingId) {
      state = await this.storage.get(this.STORAGE_KEY + bookingId);
      if (!state) return null;
    }

    state.status = status;
    if (errorMessage) {
      state.errorMessage = errorMessage;
    }

    // Update storage
    await this.storage.set(this.STORAGE_KEY + bookingId, state);

    // Update subject
    this.paymentStateSubject.next(state);

    // If payment completed or failed, stop timers
    if (status === 'completed' || status === 'failed' || status === 'cancelled') {
      this.stopTimers();
      await this.clearPaymentState(bookingId);
    }

    return state;
  }

  /**
   * Start the countdown timer
   */
  private startCountdownTimer(bookingId: number): void {
    // Clear existing timer
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }

    // Update time remaining every second
    this.timerSubscription = interval(this.POLL_INTERVAL)
      .pipe(
        takeUntil(this.destroy$),
        tap(async () => {
          const state = this.paymentStateSubject.value;
          if (!state || state.bookingId !== bookingId) return;

          const now = Date.now();
          const timeRemaining = Math.max(0, state.expiresAt - now);

          state.timeRemaining = timeRemaining;

          // Check if time expired
          if (timeRemaining <= 0) {
            state.status = 'expired';
            await this.updatePaymentStatus(bookingId, 'expired');
            this.stopTimers();
            return;
          }

          // Update storage with remaining time
          await this.storage.set(this.STORAGE_KEY + bookingId, state);
          this.paymentStateSubject.next(state);
        })
      )
      .subscribe();
  }

  /**
   * Poll backend for payment status updates
   */
  private startPollingForStatus(bookingId: number): void {
    // Clear existing poll
    if (this.pollSubscription) {
      this.pollSubscription.unsubscribe();
    }

    // Poll every 3 seconds (or less frequently to reduce server load)
    this.pollSubscription = interval(3000)
      .pipe(
        takeUntil(this.destroy$),
        tap(async () => {
          const state = this.paymentStateSubject.value;
          if (!state || state.bookingId !== bookingId) return;

          // Only poll if still pending
          if (state.status !== 'pending' && state.status !== 'processing') {
            this.stopTimers();
            return;
          }

          // Poll backend for status (implementation depends on your API service)
          // This would be called from your component or via an HTTP interceptor
        })
      )
      .subscribe();
  }

  /**
   * Stop all active timers
   */
  private stopTimers(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = null;
    }
    if (this.pollSubscription) {
      this.pollSubscription.unsubscribe();
      this.pollSubscription = null;
    }
  }

  /**
   * Clear payment state from storage
   */
  async clearPaymentState(bookingId: number): Promise<void> {
    await this.storage.remove(this.STORAGE_KEY + bookingId);
  }

  /**
   * Get formatted time remaining (MM:SS)
   */
  getFormattedTimeRemaining(state: PaymentState): string {
    const totalSeconds = Math.floor(state.timeRemaining / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  /**
   * Get color indicator for remaining time
   */
  getTimeWarningColor(state: PaymentState): string {
    const totalSeconds = Math.floor(state.timeRemaining / 1000);
    if (totalSeconds > 5 * 60) return 'success'; // More than 5 minutes
    if (totalSeconds > 2 * 60) return 'warning'; // More than 2 minutes
    return 'danger'; // Less than 2 minutes
  }

  /**
   * Check if payment has expired
   */
  isExpired(state: PaymentState): boolean {
    return state.status === 'expired' || state.timeRemaining <= 0;
  }

  /**
   * Get payment state
   */
  getPaymentState(): PaymentState | null {
    return this.paymentStateSubject.value;
  }

  /**
   * Cleanup on destroy
   */
  ngOnDestroy(): void {
    this.stopTimers();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
