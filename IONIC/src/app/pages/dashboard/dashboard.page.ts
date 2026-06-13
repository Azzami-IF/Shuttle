import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { UiService } from '../../services/ui.service';
import { LanguageService } from '../../services/language.service';

@Component({
  standalone: false,
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage {
  private auth = inject(AuthService);
  private api = inject(ApiService);
  private router = inject(Router);
  private ui = inject(UiService);
  private languageService = inject(LanguageService);

  user$ = this.auth.user$;
  lang$ = this.languageService.lang$;
  currentUser: any = null;
  previewSchedules: any[] = [];
  featuredSchedule: any = null;
  schedulePreviewLoading = false;
  searchData = {
    origin: 'Jakarta',
    destination: 'Bandung',
    date: new Date().toISOString().substring(0, 10)
  };

  constructor() {}

  ionViewWillEnter() {
    this.currentUser = this.getResolvedUser();
    if (this.currentUser?.role === 'customer') {
      this.loadSchedulePreview();
    }
  }

  getResolvedUser() {
    if (this.currentUser) {
      return this.currentUser;
    }

    const cached = localStorage.getItem('user');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return null;
      }
    }

    return null;
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    const g = this.languageService.get('greeting');
    const isId = this.languageService.getCurrentLang() === 'id';

    if (hour < 11) return isId ? `${g} Pagi` : `${g} Morning`;
    if (hour < 15) return isId ? `${g} Siang` : `${g} Afternoon`;
    if (hour < 18) return isId ? `${g} Sore` : `${g} Afternoon`;
    return isId ? `${g} Malam` : `${g} Evening`;
  }

  getTranslation(key: string): string {
    return this.languageService.get(key);
  }

  showPending() {
    this.ui.showFeaturePending();
  }

  loadSchedulePreview() {
    this.schedulePreviewLoading = true;
    const params = new URLSearchParams({
      origin: this.searchData.origin,
      destination: this.searchData.destination,
      date: this.searchData.date,
    });

    this.api.get(`schedules?${params.toString()}`).subscribe({
      next: (res: any[]) => {
        const schedules = (res || []).slice().sort((a: any, b: any) => new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime());
        this.previewSchedules = schedules.slice(0, 3);
        this.featuredSchedule = schedules.length ? schedules[0] : null;
        this.schedulePreviewLoading = false;
      },
      error: () => {
        this.previewSchedules = [];
        this.featuredSchedule = null;
        this.schedulePreviewLoading = false;
      }
    });
  }

  refreshSchedulePreview() {
    this.loadSchedulePreview();
  }

  getAvailableSeats(schedule: any) {
    if (!schedule?.seats) return 0;
    return schedule.seats.filter((seat: any) => seat.status === 'available').length;
  }

  formatTime(value: string): string {
    if (!value) return '--:--';
    return new Date(value).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  }

  getCountdownLabel(value: string): string {
    if (!value) return 'Jadwal tidak tersedia';

    const diffMs = new Date(value).getTime() - Date.now();
    if (diffMs <= 0) return 'Sedang berlangsung / siap berangkat';

    const diffMin = Math.round(diffMs / 60000);
    if (diffMin < 60) return `Berangkat dalam ${diffMin} menit`;

    const hours = Math.floor(diffMin / 60);
    const minutes = diffMin % 60;
    return `Berangkat dalam ${hours} jam ${minutes} menit`;
  }

  searchTickets() {
    this.router.navigate(['/schedule-list'], {
      queryParams: {
        origin: this.searchData.origin,
        destination: this.searchData.destination,
        date: this.searchData.date
      }
    });
  }

  viewSchedule(id: number) {
    this.router.navigate(['/seat-selection', { id }]);
  }

  async confirmLogout() {
    const confirmed = await this.ui.showConfirm('Logout', 'Anda akan keluar dari akun ini. Lanjutkan?', 'Logout');
    if (!confirmed) {
      return;
    }

    this.auth.logout().subscribe({
      next: () => {
        this.currentUser = null;
        this.router.navigate(['/login'], { replaceUrl: true });
      },
      error: (err) => {
        console.error('Logout failed', err);
        this.currentUser = null;
        this.router.navigate(['/login'], { replaceUrl: true });
      }
    });
  }
}
