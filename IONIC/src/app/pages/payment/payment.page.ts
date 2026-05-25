import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { UiService } from '../../services/ui.service';

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
    private router: Router,
    private auth: AuthService,
    private ui: UiService
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
        void this.ui.showAlert('Waktu Habis', 'Waktu pembayaran Anda telah habis. Pemesanan ini dibatalkan.');
        this.router.navigate([this.auth.getHomeRoute()], { replaceUrl: true });
      }
    }, 1000);
  }

  confirmPayment() {
    this.api.post(`bookings/${this.bookingId}/confirm-payment`, {}).subscribe({
      next: () => {
        // Use toast or similar in production, alert for now
        void this.ui.showToast('Pembayaran berhasil dikonfirmasi!', 'success');
        this.router.navigate(['/booking-detail'], { replaceUrl: true });
      },
      error: (err) => {
        void this.ui.showAlert('Gagal konfirmasi', this.ui.getErrorMessage(err, 'Error server'));
      }
    });
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

  goBack() {
    window.history.back();
  }
}
