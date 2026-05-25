import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: false,
  selector: 'app-booking-detail',
  templateUrl: './booking-detail.page.html',
  styleUrls: ['./booking-detail.page.scss'],
})
export class BookingDetailPage {
  bookings: any[] = [];
  searchTerm: string = '';
  homeRoute = '/dashboard';

  constructor(
    private api: ApiService,
    private router: Router,
    private auth: AuthService
  ) {}

  ionViewWillEnter() {
    this.homeRoute = this.auth.getHomeRoute();
    this.loadBookings();
  }

  loadBookings() {
    let path = 'bookings';
    if (this.searchTerm) {
      path += `?search=${encodeURIComponent(this.searchTerm)}`;
    }

    this.api.get(path).subscribe({
      next: (res: any) => {
        this.bookings = res.sort((a: any, b: any) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      },
      error: (err) => {
        console.error('Error loading bookings', err);
      }
    });
  }

  onSearchChange() {
    this.loadBookings();
  }

  viewTracking(booking: any) {
    if (booking.schedule?.trip?.id) {
      this.router.navigate(['/trip-tracking', { id: booking.schedule.trip.id }]);
    }
  }

  isTrackable(booking: any): boolean {
    if (!booking.schedule?.trip) return false;
    const trackableStatuses = ['boarding', 'on-going', 'arrived', 'delayed', 'completed'];
    return trackableStatuses.includes(booking.schedule.trip.status);
  }

  getSeatLabel(seat: any): string {
    if (!seat || !seat.seat_number) return '';
    const index = parseInt(seat.seat_number, 10) - 1;
    if (isNaN(index)) return seat.seat_number;
    const rowNum = Math.floor(index / 4) + 1;
    const colIndex = index % 4;
    const letters = ['A', 'B', 'C', 'D'];
    return `${rowNum}${letters[colIndex]}`;
  }
}
