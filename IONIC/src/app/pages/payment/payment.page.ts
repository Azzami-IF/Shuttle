import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  standalone: false,
  selector: 'app-payment',
  templateUrl: './payment.page.html',
  styleUrls: ['./payment.page.scss'],
})
export class PaymentPage implements OnInit {
  bookingId: any;
  booking: any;
  countdown: string = '14:59';
  timer: any;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private router: Router
  ) { }

  ngOnInit() {
    this.bookingId = this.route.snapshot.paramMap.get('id');
    this.loadBooking();
    this.startTimer(15 * 60);
  }

  loadBooking() {
    this.api.get(`bookings/${this.bookingId}`).subscribe(res => {
      this.booking = res;
    });
  }

  startTimer(duration: number) {
    let timer = duration, minutes, seconds;
    this.timer = setInterval(() => {
      minutes = Math.floor(timer / 60);
      seconds = timer % 60;

      this.countdown = (minutes < 10 ? '0' + minutes : minutes) + ':' + (seconds < 10 ? '0' + seconds : seconds);

      if (--timer < 0) {
        clearInterval(this.timer);
        this.countdown = '00:00';
      }
    }, 1000);
  }

  confirmPayment() {
    this.api.post(`bookings/${this.bookingId}/confirm-payment`, {}).subscribe({
      next: () => {
        // Use toast or similar in production, alert for now
        alert('Pembayaran berhasil dikonfirmasi!');
        this.router.navigate(['/booking-detail'], { replaceUrl: true });
      },
      error: (err) => {
        alert('Gagal konfirmasi: ' + (err.error?.message || 'Error server'));
      }
    });
  }

  goBack() {
    window.history.back();
  }
}
