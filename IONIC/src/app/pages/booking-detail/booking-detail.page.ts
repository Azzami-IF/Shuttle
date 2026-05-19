import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-booking-detail',
  templateUrl: './booking-detail.page.html',
})
export class BookingDetailPage implements OnInit {
  bookingId: any;
  booking: any;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService
  ) {}

  ngOnInit() {
    this.bookingId = this.route.snapshot.paramMap.get('id');
    if (this.bookingId) {
      this.loadBooking();
    }
  }

  loadBooking() {
    this.api.get(`bookings/${this.bookingId}`).subscribe(res => {
      this.booking = res;
    });
  }
}
