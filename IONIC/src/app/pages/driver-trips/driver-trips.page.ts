import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: false,
  selector: 'app-driver-trips',
  templateUrl: './driver-trips.page.html',
  styleUrls: ['./driver-trips.page.scss'],
})
export class DriverTripsPage {
  user$ = this.auth.user$;
  trips: any[] = [];
  nextTrip: any = null;
  laterTrips: any[] = [];
  activeTrip: any = null;
  today = new Date();

  constructor(
    private api: ApiService,
    private auth: AuthService
  ) {}

  ionViewWillEnter() {
    this.loadTrips();
  }

  loadTrips() {
    this.api.get('trips').subscribe((res: any[]) => {
      this.trips = res;
      this.activeTrip = this.trips.find(t => t.status === 'on-going');

      const scheduledTrips = this.trips
        .filter(t => t.status === 'scheduled')
        .sort((a, b) => new Date(a.schedule.departure_time).getTime() - new Date(b.schedule.departure_time).getTime());

      if (scheduledTrips.length > 0) {
        this.nextTrip = scheduledTrips[0];
        this.laterTrips = scheduledTrips.slice(1);
      } else {
        this.nextTrip = null;
        this.laterTrips = [];
      }
    });
  }

  getStatusColor(status: string) {
    switch (status) {
      case 'scheduled': return 'primary';
      case 'on-going': return 'success';
      case 'completed': return 'medium';
      default: return 'light';
    }
  }

  startTrip(trip: any) {
    this.api.post(`trips/${trip.id}/start`, {}).subscribe(() => {
      this.loadTrips();
    });
  }

  completeTrip(trip: any) {
    this.api.post(`trips/${trip.id}/complete`, {}).subscribe(() => {
      this.loadTrips();
    });
  }

  updateLocation() {
    if (!this.activeTrip) return;

    // Simulate location update for demo
    const lat = -6.2088 + (Math.random() - 0.5) * 0.01;
    const lng = 106.8456 + (Math.random() - 0.5) * 0.01;

    this.api.post(`trips/${this.activeTrip.id}/location`, {
      latitude: lat,
      longitude: lng
    }).subscribe(() => {
      console.log('Location updated');
    });
  }
}
