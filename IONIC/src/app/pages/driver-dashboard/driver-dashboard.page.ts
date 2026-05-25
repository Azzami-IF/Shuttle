import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { UiService } from '../../services/ui.service';

@Component({
  standalone: false,
  selector: 'app-driver-dashboard',
  templateUrl: './driver-dashboard.page.html',
  styleUrls: ['./driver-dashboard.page.scss'],
})
export class DriverDashboardPage {
  user$ = this.auth.user$;
  upcomingTrips: any[] = [];
  featuredTrip: any = null;
  tripSummaryLoading = false;

  constructor(
    private auth: AuthService,
    private api: ApiService,
    private router: Router,
    private ui: UiService
  ) {}

  ionViewWillEnter() {
    this.loadTripSummary();
  }

  showPending() {
    this.ui.showFeaturePending();
  }

  loadTripSummary() {
    this.tripSummaryLoading = true;
    this.api.get('trips').subscribe({
      next: (res: any[]) => {
        const trips = res || [];
        const scheduledTrips = trips
          .filter(t => t.status === 'scheduled')
          .sort((a, b) => new Date(a.schedule?.departure_time).getTime() - new Date(b.schedule?.departure_time).getTime());

        this.featuredTrip = scheduledTrips.length ? scheduledTrips[0] : null;
        this.upcomingTrips = scheduledTrips.slice(1, 4);
        this.tripSummaryLoading = false;
      },
      error: () => {
        this.featuredTrip = null;
        this.upcomingTrips = [];
        this.tripSummaryLoading = false;
      }
    });
  }

  refreshTripSummary() {
    this.loadTripSummary();
  }

  formatTime(value: string): string {
    if (!value) return '--:--';
    return new Date(value).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  }

  getCountdownLabel(value: string): string {
    if (!value) return 'Jadwal tidak tersedia';

    const diffMs = new Date(value).getTime() - Date.now();
    if (diffMs <= 0) return 'Siap berangkat';

    const diffMin = Math.round(diffMs / 60000);
    if (diffMin < 60) return `${diffMin} menit lagi`;

    const hours = Math.floor(diffMin / 60);
    const minutes = diffMin % 60;
    return `${hours} jam ${minutes} menit lagi`;
  }

  async confirmLogout() {
    const confirmed = await this.ui.showConfirm('Logout', 'Anda akan keluar dari akun driver ini. Lanjutkan?');
    if (!confirmed) {
      return;
    }

    this.auth.logout().subscribe({
      next: () => {
        this.router.navigate(['/driver-login'], { replaceUrl: true });
      },
      error: (err) => {
        console.error('Logout failed', err);
        this.router.navigate(['/driver-login'], { replaceUrl: true });
      }
    });
  }
}
