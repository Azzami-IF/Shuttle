import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  standalone: false,
  selector: 'app-booking-detail',
  templateUrl: './booking-detail.page.html',
  styleUrls: ['./booking-detail.page.scss'],
})
export class BookingDetailPage {
  bookings: any[] = [];
  searchTerm: string = '';

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  ionViewWillEnter() {
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
}
