import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-schedule-list',
  templateUrl: './schedule-list.page.html',
  styleUrls: ['./schedule-list.page.scss'],
})
export class ScheduleListPage implements OnInit {
  schedules: any[] = [];

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadSchedules();
  }

  loadSchedules() {
    this.api.get('schedules').subscribe(res => {
      this.schedules = res;
    });
  }

  getAvailableSeats(schedule: any) {
    if (!schedule.seats) return 0;
    return schedule.seats.filter((s: any) => s.status === 'available').length;
  }

  viewSchedule(id: number) {
    this.router.navigate(['/seat-selection', { id }]);
  }
}
