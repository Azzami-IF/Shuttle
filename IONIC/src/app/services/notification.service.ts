import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval, Subject } from 'rxjs';
import { takeUntil, switchMap, tap, startWith } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface AppNotification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'danger' | 'info';
  data?: any;
  read_at?: string;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<AppNotification[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  private destroy$ = new Subject<void>();
  private pollInterval = 30000; // Poll every 30 seconds

  constructor(private api: ApiService) {
    this.initializeNotifications();
  }

  /**
   * Initialize notifications on app startup
   */
  private initializeNotifications(): void {
    // Load initial unread count
    this.getUnreadCount();

    // Load unread notifications
    this.loadUnreadNotifications();

    // Setup polling for new notifications every 30 seconds
    this.setupPolling();
  }

  /**
   * Setup automatic polling for new notifications
   */
  private setupPolling(): void {
    interval(this.pollInterval)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.api.get('notifications/unread')),
        tap((response: any) => {
          const notifications = response.notifications || [];
          this.notificationsSubject.next(notifications);
          this.unreadCountSubject.next(notifications.length);
        })
      )
      .subscribe({
        error: (err) => {
          console.error('Notification polling error:', err);
        }
      });
  }

  /**
   * Load unread notifications
   */
  loadUnreadNotifications(): Observable<any> {
    return this.api.get('notifications/unread').pipe(
      tap((response: any) => {
        const notifications = response.notifications || [];
        this.notificationsSubject.next(notifications);
        this.unreadCountSubject.next(notifications.length);
      })
    );
  }

  /**
   * Get unread count
   */
  getUnreadCount(): Observable<any> {
    return this.api.get('notifications/count').pipe(
      tap((response: any) => {
        this.unreadCountSubject.next(response.unread_count || 0);
      })
    );
  }

  /**
   * Get all notifications
   */
  getAllNotifications(page: number = 1, limit: number = 20): Observable<any> {
    return this.api.get(`notifications?page=${page}&per_page=${limit}`);
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: number): Observable<any> {
    return this.api.post(`notifications/${notificationId}/mark-read`, {}).pipe(
      tap(() => {
        const current = this.notificationsSubject.value;
        const updated = current.filter(n => n.id !== notificationId);
        this.notificationsSubject.next(updated);

        const count = this.unreadCountSubject.value;
        this.unreadCountSubject.next(Math.max(0, count - 1));
      })
    );
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): Observable<any> {
    return this.api.post('notifications/mark-all-read', {}).pipe(
      tap(() => {
        this.notificationsSubject.next([]);
        this.unreadCountSubject.next(0);
      })
    );
  }

  /**
   * Delete notification
   */
  deleteNotification(notificationId: number): Observable<any> {
    return this.api.delete(`notifications/${notificationId}`).pipe(
      tap(() => {
        const current = this.notificationsSubject.value;
        const updated = current.filter(n => n.id !== notificationId);
        this.notificationsSubject.next(updated);
      })
    );
  }

  /**
   * Delete all read notifications
   */
  deleteReadNotifications(): Observable<any> {
    return this.api.delete('notifications/read');
  }

  /**
   * Get current unread notifications
   */
  getUnreadNotifications(): AppNotification[] {
    return this.notificationsSubject.value;
  }

  /**
   * Get unread count
   */
  getUnreadNotificationCount(): number {
    return this.unreadCountSubject.value;
  }

  /**
   * Manually refresh notifications
   */
  refresh(): Observable<any> {
    return this.loadUnreadNotifications();
  }

  /**
   * Stop all subscriptions
   */
  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
