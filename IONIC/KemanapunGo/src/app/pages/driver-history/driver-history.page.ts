import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  standalone: false,
  selector: 'app-driver-history',
  templateUrl: './driver-history.page.html',
  styleUrls: ['./driver-history.page.scss'],
})
export class DriverHistoryPage {
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
      this.trips = (res || []).filter(t => t.status === 'completed')
        .sort((a, b) => new Date(b.completed_at || b.updated_at).getTime() - new Date(a.completed_at || a.updated_at).getTime());
      this.summary.totalTrips = this.trips.length;
      this.summary.totalDistance = this.trips.length * 150; // Bandung to Jakarta is approx 150km
    });
  }
}
