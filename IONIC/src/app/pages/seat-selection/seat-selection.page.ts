import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-seat-selection',
  templateUrl: './seat-selection.page.html',
  styleUrls: ['./seat-selection.page.scss'],
})
export class SeatSelectionPage implements OnInit {
  scheduleId: any;
  schedule: any;
  selectedSeat: any;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.scheduleId = this.route.snapshot.paramMap.get('id');
    this.loadSchedule();
  }

  loadSchedule() {
    this.api.get(`schedules/${this.scheduleId}`).subscribe(res => {
      this.schedule = res;
    });
  }

  selectSeat(seat: any) {
    if (seat.status === 'booked') return;
    this.selectedSeat = seat;
  }

  confirmBooking() {
    this.api.post('bookings', {
      schedule_id: this.scheduleId,
      seat_id: this.selectedSeat.id
    }).subscribe({
      next: (res) => {
        alert('Booking successful!');
        this.router.navigate(['/booking-detail', { id: res.id }]);
      },
      error: (err) => {
        alert('Booking failed: ' + (err.error?.message || 'Unknown error'));
      }
    });
  }
}
