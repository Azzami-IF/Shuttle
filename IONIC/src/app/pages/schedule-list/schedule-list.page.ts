import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  standalone: false,
  selector: 'app-schedule-list',
  templateUrl: './schedule-list.page.html',
  styleUrls: ['./schedule-list.page.scss'],
})
export class ScheduleListPage {
  schedules: any[] = [];
  filters = {
    origin: '',
    destination: '',
    date: ''
  };

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  ionViewWillEnter() {
    this.loadSchedules();
  }

  loadSchedules() {
    let params: any = {};
    if (this.filters.origin) params.origin = this.filters.origin;
    if (this.filters.destination) params.destination = this.filters.destination;
    if (this.filters.date) params.date = this.filters.date;

    // We'll need to update ApiService to handle params, or just append manually
    const query = Object.keys(params)
      .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
      .join('&');

    const path = query ? `schedules?${query}` : 'schedules';

    this.api.get(path).subscribe(res => {
      this.schedules = res;
    });
  }

  onFilterChange() {
    this.loadSchedules();
  }

  getAvailableSeats(schedule: any) {
    if (!schedule.seats) return 0;
    return schedule.seats.filter((s: any) => s.status === 'available').length;
  }

  viewSchedule(id: number) {
    this.router.navigate(['/seat-selection', { id }]);
  }
}
