import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  standalone: false,
  selector: 'app-booking-detail',
  templateUrl: './booking-detail.page.html',
  styleUrls: ['./booking-detail.page.scss'],
})
export class BookingDetailPage implements OnInit {
  bookingId: any;
  booking: any;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.bookingId = this.route.snapshot.paramMap.get('id');
    if (this.bookingId) {
      this.loadBooking();
    } else {
        // If no ID provided, maybe show latest booking?
        this.api.get('bookings').subscribe(res => {
            if (res.length > 0) {
                this.booking = res[res.length - 1];
            }
        });
    }
  }

  loadBooking() {
    this.api.get(`bookings/${this.bookingId}`).subscribe(res => {
      this.booking = res;
    });
  }

  cancelBooking() {
    this.api.post(`bookings/${this.booking.id}/cancel`, {}).subscribe(() => {
      alert('Booking cancelled');
      this.router.navigate(['/dashboard']);
    });
  }
}
