import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  standalone: false,
  selector: 'app-driver-tracking',
  templateUrl: './driver-tracking.page.html',
  styleUrls: ['./driver-tracking.page.scss'],
})
export class DriverTrackingPage implements OnInit, OnDestroy {
  tripId: any;
  trip: any;
  passengers: any[] = [];
  metrics = {
    fuel: 82,
    temp: 'Normal'
  };
  shiftTimer = '03:24:15';
  timerInterval: any;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.tripId = this.route.snapshot.paramMap.get('id');
    this.loadTrip();
    this.startTimer();
  }

  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  loadTrip() {
    this.api.get(`trips/${this.tripId}`).subscribe((res: any) => {
      this.trip = res;
      // In a real app, passengers would be linked to the schedule
      this.loadPassengers();
    });
  }

  loadPassengers() {
    if (!this.trip?.schedule_id) return;
    this.api.get(`bookings?schedule_id=${this.trip.schedule_id}`).subscribe((res: any[]) => {
      this.passengers = res;
    });
  }

  updateStatus(status: string) {
    let endpoint = '';
    if (status === 'ongoing') endpoint = 'start';
    if (status === 'completed') endpoint = 'complete';

    if (endpoint) {
      this.api.post(`trips/${this.tripId}/${endpoint}`, {}).subscribe(() => {
        this.loadTrip();
      });
    }
  }

  updateLocation() {
    const lat = -6.2088 + (Math.random() - 0.5) * 0.01;
    const lng = 106.8456 + (Math.random() - 0.5) * 0.01;

    this.api.post(`trips/${this.tripId}/location`, {
      latitude: lat,
      longitude: lng
    }).subscribe(() => {
      alert('Lokasi berhasil diperbarui');
    });
  }

  startTimer() {
    // Simulated decrement
    this.timerInterval = setInterval(() => {
      // Simple logic to keep it looking active
    }, 1000);
  }
}
