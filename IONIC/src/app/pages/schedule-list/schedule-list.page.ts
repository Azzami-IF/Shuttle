import { Component, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';

@Component({
  standalone: false,
  selector: 'app-schedule-list',
  templateUrl: './schedule-list.page.html',
  styleUrls: ['./schedule-list.page.scss'],
})
export class ScheduleListPage {
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);
  private languageService = inject(LanguageService);

  schedules: any[] = [];
  displaySchedules: any[] = [];
  lang$ = this.languageService.lang$;
  loading: boolean = false;
  filters = {
    origin: '',
    destination: '',
    date: ''
  };
  sortBy: string = '';
  searchTerm: string = '';
  homeRoute = '/dashboard';

  constructor() {}

  ionViewWillEnter() {
    this.homeRoute = this.auth.getHomeRoute();
    this.route.queryParams.subscribe(params => {
      if (params['origin']) this.filters.origin = params['origin'];
      if (params['destination']) this.filters.destination = params['destination'];
      if (params['date']) this.filters.date = params['date'];
      this.loadSchedules();
    });
  }

  loadSchedules() {
    this.loading = true;
    let params: any = {};
    if (this.filters.origin) params.origin = this.filters.origin;
    if (this.filters.destination) params.destination = this.filters.destination;
    if (this.filters.date) params.date = this.filters.date;

    const query = Object.keys(params)
      .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
      .join('&');

    const path = query ? `schedules?${query}` : 'schedules';

    this.api.get(path).subscribe((res: any) => {
      this.schedules = res || [];
      this.applySorting();
      this.applySearch();
      this.loading = false;
    });
  }

  applySorting() {
    if (this.sortBy === 'time') {
      this.schedules.sort((a, b) => new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime());
    } else if (this.sortBy === 'price') {
      this.schedules.sort((a, b) => (a.price || 85000) - (b.price || 85000));
    }
  }

  setSort(type: string) {
    this.sortBy = type;
    this.applySorting();
  }

  onFilterChange() {
    this.loadSchedules();
  }

  applySearch() {
    const term = (this.searchTerm || '').toLowerCase().trim();
    if (!term) {
      this.displaySchedules = [...this.schedules];
      return;
    }

    this.displaySchedules = this.schedules.filter(s => {
      const origin = (s.origin || '').toString().toLowerCase();
      const dest = (s.destination || '').toString().toLowerCase();
      const vehicle = (s.vehicle?.name || '').toString().toLowerCase();
      return origin.includes(term) || dest.includes(term) || vehicle.includes(term);
    });
  }

  getAvailableSeats(schedule: any) {
    if (!schedule.seats) return 0;
    return schedule.seats.filter((s: any) => s.status === 'available').length;
  }

  viewSchedule(id: number) {
    this.router.navigate(['/seat-selection', { id }]);
  }

  getTranslation(key: string) {
    return this.languageService.get(key);
  }
}
