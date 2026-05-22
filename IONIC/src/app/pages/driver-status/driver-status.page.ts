import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  standalone: false,
  selector: 'app-driver-status',
  templateUrl: './driver-status.page.html',
  styleUrls: ['./driver-status.page.scss'],
})
export class DriverStatusPage {
  trips: any[] = [];
  summary = {
    totalTrips: 42,
    totalDistance: 1284
  };

  constructor(private api: ApiService) {}

  ionViewWillEnter() {
    this.loadHistory();
  }

  loadHistory() {
    this.api.get('trips').subscribe((res: any[]) => {
      this.trips = res.filter(t => t.status === 'completed')
        .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
    });
  }
}
