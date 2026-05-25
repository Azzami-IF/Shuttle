import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { UiService } from '../../services/ui.service';

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
  locationInterval: any = null;
  gpsStatus: string = 'Menunggu...';
  lastUpdateTime: string = '';
  metrics = {
    fuel: 88,
    temp: 'Normal'
  };
  shiftTimer: string = '03:24:15';
  passengerCount = 0;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private router: Router,
    private ui: UiService
  ) {}

  ngOnInit() {
    this.tripId = this.route.snapshot.paramMap.get('id');
    this.loadTrip();
  }

  ngOnDestroy() {
    this.stopLocationUpdates();
  }

  loadTrip() {
    this.api.get(`trips/${this.tripId}`).subscribe((res: any) => {
      this.trip = res;
      if (res && res.status === 'on-going') {
        this.startLocationUpdates();
      } else {
        this.stopLocationUpdates();
      }
      this.loadPassengers();
    });
  }

  startLocationUpdates() {
    if (this.locationInterval) return;
    this.gpsStatus = 'Aktif (setiap 10 detik)';
    this.autoUpdateLocation(); // Send one immediately
    this.locationInterval = setInterval(() => {
      this.autoUpdateLocation();
    }, 10000);
  }

  stopLocationUpdates() {
    if (this.locationInterval) {
      clearInterval(this.locationInterval);
      this.locationInterval = null;
    }
    this.gpsStatus = 'Tidak aktif';
  }

  updateLocation() {
    this.autoUpdateLocation();
  }

  autoUpdateLocation() {
    if (!this.trip) return;

    // Default start from Bandung if no coordinates exist yet
    if (!this.trip.latitude || this.trip.latitude == 0) {
      this.trip.latitude = -6.9452;
      this.trip.longitude = 107.5937;
    }

    // Target is Kampung Rambutan Jakarta: -6.3090, 106.8824
    const targetLat = -6.3090;
    const targetLng = 106.8824;

    const latDiff = targetLat - this.trip.latitude;
    const lngDiff = targetLng - this.trip.longitude;

    // If we are already extremely close, stop moving, just add tiny noise
    if (Math.abs(latDiff) < 0.001 && Math.abs(lngDiff) < 0.001) {
      this.trip.latitude += (Math.random() - 0.5) * 0.0001;
      this.trip.longitude += (Math.random() - 0.5) * 0.0001;
    } else {
      // Step size is 5% towards target + random jitter
      this.trip.latitude += latDiff * 0.05 + (Math.random() - 0.5) * 0.001;
      this.trip.longitude += lngDiff * 0.05 + (Math.random() - 0.5) * 0.001;
    }

    this.api.post(`trips/${this.tripId}/location`, {
      latitude: this.trip.latitude,
      longitude: this.trip.longitude
    }).subscribe({
      next: () => {
        this.lastUpdateTime = new Date().toLocaleTimeString('id-ID');
        console.log('Driver location auto-updated to', this.trip.latitude, this.trip.longitude);
      },
      error: (err) => console.error('Driver location auto-update failed', err)
    });
  }

  loadPassengers() {
    if (!this.trip?.schedule_id) return;
    this.api.get(`bookings?schedule_id=${this.trip.schedule_id}`).subscribe((res: any[]) => {
      this.passengers = res || [];
      this.passengerCount = this.passengers.length;
    });
  }

  updateStatus(status: string) {
    const endpoint = status === 'completed' ? 'complete' : 'status';
    const payload = status === 'completed' ? {} : { status };

    this.api.post(`trips/${this.tripId}/${endpoint}`, payload).subscribe({
      next: () => {
        void this.ui.showToast(`Status perjalanan diperbarui ke ${status}`, 'success');
        if (status === 'completed') {
          this.stopLocationUpdates();
        }
        this.loadTrip();
      },
      error: () => {
        void this.ui.showToast('Gagal memperbarui status perjalanan', 'danger');
      }
    });
  }

  isStatus(status: string) {
    return this.trip?.status === status;
  }

  getSeatLabel(seat: any): string {
    if (!seat || !seat.seat_number) return '-';
    const index = parseInt(seat.seat_number, 10) - 1;
    if (isNaN(index)) return seat.seat_number;
    const rowNum = Math.floor(index / 4) + 1;
    const colIndex = index % 4;
    const letters = ['A', 'B', 'C', 'D'];
    return `${rowNum}${letters[colIndex]}`;
  }
}
