import { Component, OnDestroy, OnInit } from '@angular/core';
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
export class PaymentPage implements OnInit, OnDestroy {
  bookingId: string | null = null;
  booking: any = null;
  loadingBooking = true;
  loadError = '';
  createError = '';

  nominalValue = 0;
  nominalDisplay = 'Rp 0';
  isCreatingVa = false;

  screen: 'input' | 'detail' = 'input';
  vaData: any = null;
  countdown = '--:--:--';
  countdownTimer: any;
  homeRoute = '/dashboard';

  readonly steps = ['Input Nominal', 'Generate VA', 'Pembayaran', 'Selesai'];

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private router: Router,
    private auth: AuthService,
    private ui: UiService
  ) { }

  ngOnInit() {
    this.homeRoute = this.auth.getHomeRoute();
    const paramMap = this.route.snapshot.paramMap;
    const queryMap = this.route.snapshot.queryParamMap;

    this.bookingId = paramMap.get('id') || queryMap.get('id');
    const stage = paramMap.get('stage') || queryMap.get('stage');

    if (stage === 'va-detail') {
      this.screen = 'detail';
    }

    const navVaData = history.state?.vaData;
    if (navVaData) {
      this.vaData = navVaData;
      this.screen = 'detail';
      this.startCountdown(new Date(navVaData.expiresAt));
    }

    if (!this.bookingId) {
      this.loadingBooking = false;
      this.loadError = 'Data booking tidak ditemukan. Silakan ulangi proses pemesanan.';
      return;
    }

    this.loadBooking();
  }

  ngOnDestroy() {
    this.stopCountdown();
  }

  loadBooking() {
    this.loadingBooking = true;
    this.loadError = '';

    this.api.get(`bookings/${this.bookingId}`).subscribe({
      next: (res) => {
        this.booking = res;
        this.loadingBooking = false;
        if (this.screen === 'detail' && !this.vaData) {
          this.createError = 'Detail Virtual Account belum tersedia. Silakan buat VA baru.';
        }
      },
      error: (err) => {
        this.loadingBooking = false;
        this.loadError = this.ui.getErrorMessage(err, 'Gagal memuat data booking.');
      }
    });
  }

  get customerName(): string {
    const localUser = JSON.parse(localStorage.getItem('user') || '{}');
    return this.booking?.user?.name || this.booking?.customer_name || localUser?.name || '-';
  }

  get bookingNumber(): string {
    return this.booking?.booking_code || `BOOK-${this.bookingId || '-'}`;
  }

  get customerEmail(): string {
    const localUser = JSON.parse(localStorage.getItem('user') || '{}');
    return this.booking?.user?.email || this.booking?.email || localUser?.email || '-';
  }

  get invoiceLabel(): string {
    return this.booking?.invoice_number || `Tagihan Booking #${this.bookingId || '-'}`;
  }

  get totalAmount(): number {
    return Number(this.booking?.total_price || this.booking?.schedule?.price || 0);
  }

  get footerNominal(): number {
    return this.nominalValue || this.totalAmount;
  }

  get canCreateVa(): boolean {
    return !this.loadingBooking && !!this.booking && this.nominalValue > 0 && !this.isCreatingVa;
  }

  get currentStep(): number {
    if (this.vaData?.status === 'PAID') {
      return 4;
    }
    if (this.screen === 'detail') {
      return 3;
    }
    if (this.isCreatingVa) {
      return 2;
    }
    return 1;
  }

  onNominalInput(event: any) {
    const rawValue = String(event?.detail?.value || '');
    const digitsOnly = rawValue.replace(/\D/g, '');

    if (!digitsOnly) {
      this.nominalValue = 0;
      this.nominalDisplay = 'Rp 0';
      return;
    }

    this.nominalValue = Number(digitsOnly);
    this.nominalDisplay = this.formatCurrency(this.nominalValue);
  }

  createVirtualAccount() {
    if (!this.booking) {
      this.createError = 'Booking belum tersedia. Silakan muat ulang halaman.';
      return;
    }

    if (this.nominalValue <= 0) {
      this.createError = 'Masukkan nominal pembayaran terlebih dahulu.';
      return;
    }

    this.createError = '';
    this.isCreatingVa = true;

    const payload = {
      amount: this.nominalValue,
      method: 'virtual_account',
    };

    this.api.post(`bookings/${this.bookingId}/virtual-account`, payload).subscribe({
      next: (res: any) => {
        this.isCreatingVa = false;
        const expiresAt = this.resolveExpiryDate(res?.expires_at);

        this.vaData = {
          vaNumber: res?.va_number || this.generateFallbackVaNumber(),
          bankName: res?.bank_name || 'Bank BCA',
          amount: Number(res?.amount || this.nominalValue),
          status: String(res?.status || 'PENDING').toUpperCase(),
          expiresAt,
        };

        this.screen = 'detail';
        this.startCountdown(expiresAt);

        this.router.navigate(['/payment', { id: this.bookingId, stage: 'va-detail' }], {
          replaceUrl: true,
          state: { vaData: this.vaData },
        });
      },
      error: () => {
        this.isCreatingVa = false;
        const expiresAt = this.resolveExpiryDate();

        this.vaData = {
          vaNumber: this.generateFallbackVaNumber(),
          bankName: 'Bank BCA',
          amount: this.nominalValue,
          status: 'PENDING',
          expiresAt,
        };

        this.screen = 'detail';
        this.startCountdown(expiresAt);
        this.createError = '';

        void this.ui.showToast('VA dibuat dalam mode simulasi. Sinkronisasi server belum tersedia.', 'warning');

        this.router.navigate(['/payment', { id: this.bookingId, stage: 'va-detail' }], {
          replaceUrl: true,
          state: { vaData: this.vaData },
        });
      },
    });
  }

  checkPaymentStatus() {
    if (!this.bookingId || !this.vaData) {
      return;
    }

    this.api.get(`bookings/${this.bookingId}`).subscribe({
      next: (res: any) => {
        this.booking = res;
        const paymentStatus = String(res?.payment_status || res?.status || '').toLowerCase();
        if (paymentStatus.includes('paid') || paymentStatus.includes('lunas')) {
          this.vaData.status = 'PAID';
          this.stopCountdown();
          this.countdown = 'LUNAS';
          void this.ui.showToast('Pembayaran berhasil terverifikasi.', 'success');
          return;
        }

        void this.ui.showToast('Pembayaran belum terdeteksi. Coba cek kembali beberapa saat lagi.', 'medium');
      },
      error: (err) => {
        void this.ui.showAlert('Gagal Cek Status', this.ui.getErrorMessage(err, 'Tidak dapat memeriksa status pembayaran.'));
      },
    });
  }

  copyVaNumber() {
    if (!this.vaData?.vaNumber) {
      return;
    }

    const text = String(this.vaData.vaNumber);
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        void this.ui.showToast('Nomor VA berhasil disalin.', 'success');
      }).catch(() => {
        this.copyUsingTextarea(text);
      });
      return;
    }

    this.copyUsingTextarea(text);
  }

  backToNominalInput() {
    this.screen = 'input';
    this.createError = '';
    this.stopCountdown();
    this.router.navigate(['/payment', { id: this.bookingId }], { replaceUrl: true });
  }

  startCountdown(expiresAt: Date) {
    this.stopCountdown();

    const updateCountdown = () => {
      const remainingSeconds = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
      this.countdown = this.formatCountdown(remainingSeconds);

      if (remainingSeconds <= 0) {
        this.stopCountdown();
        if (this.vaData && this.vaData.status !== 'PAID') {
          this.vaData.status = 'EXPIRED';
          this.createError = 'Masa berlaku VA telah habis. Silakan buat Virtual Account baru.';
        }
      }
    };

    updateCountdown();
    this.countdownTimer = setInterval(updateCountdown, 1000);
  }

  stopCountdown() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
  }

  resolveExpiryDate(value?: string): Date {
    if (value) {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }

    return new Date(Date.now() + 15 * 60 * 1000);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  }

  formatCountdown(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds].map((part) => String(part).padStart(2, '0')).join(':');
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'PAID':
        return 'Lunas';
      case 'EXPIRED':
        return 'Kadaluarsa';
      default:
        return 'Menunggu Pembayaran';
    }
  }

  private generateFallbackVaNumber(): string {
    const random = Math.floor(100000000 + Math.random() * 900000000);
    return `3880${random}`;
  }

  private copyUsingTextarea(text: string) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();

    try {
      document.execCommand('copy');
      void this.ui.showToast('Nomor VA berhasil disalin.', 'success');
    } catch {
      void this.ui.showAlert('Gagal Menyalin', 'Silakan salin nomor VA secara manual.');
    } finally {
      document.body.removeChild(textArea);
    }
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
