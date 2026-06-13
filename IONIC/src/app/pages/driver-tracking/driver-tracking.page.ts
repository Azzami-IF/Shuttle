import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { UiService } from '../../services/ui.service';
import { LanguageService } from '../../services/language.service';

@Component({
  standalone: false,
  selector: 'app-driver-tracking',
  templateUrl: './driver-tracking.page.html',
  styleUrls: ['./driver-tracking.page.scss'],
})
export class DriverTrackingPage implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private router = inject(Router);
  private ui = inject(UiService);
  langService = inject(LanguageService);

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

  constructor() {}

  getTranslation(key: string): string {
    return this.langService.get(key);
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.tripId = params['id'];
      if (this.tripId) {
        this.loadTrip();
      }
    });
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
      
      // Load passengers only after trip data is available
      if (this.trip && this.trip.schedule_id) {
        this.loadPassengers();
      }
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
    if (!this.trip || !this.trip.schedule) return;

    // Database koordinat (Bisa dipindah ke service nantinya)
    const coordinatesMap: { [key: string]: [number, number] } = {
      'jakarta': [-6.3090, 106.8824],
      'karawang': [-6.3073, 107.2913],
      'sumedang': [-6.8524, 107.9234],
      'bandung': [-6.9452, 107.5937],
      'subang': [-6.5715, 107.7587],
      'purwakarta': [-6.5571, 107.4431]
    };

    const originName = (this.trip.schedule.origin || '').toLowerCase().trim();
    const destName = (this.trip.schedule.destination || '').toLowerCase().trim();

    // Set posisi awal jika belum ada
    if (!this.trip.latitude || this.trip.latitude == 0) {
      const originCoords = coordinatesMap[originName] || [-6.9452, 107.5937];
      this.trip.latitude = originCoords[0];
      this.trip.longitude = originCoords[1];
    }

    // Target sesuai tujuan di jadwal
    const destCoords = coordinatesMap[destName] || [-6.3090, 106.8824];
    const targetLat = destCoords[0];
    const targetLng = destCoords[1];

    const latDiff = targetLat - this.trip.latitude;
    const lngDiff = targetLng - this.trip.longitude;

    if (Math.abs(latDiff) < 0.0005 && Math.abs(lngDiff) < 0.0005) {
      // Sampai di tujuan
      this.trip.latitude = targetLat;
      this.trip.longitude = targetLng;
    } else {
      // Kecepatan normal (Langkah sangat kecil: 0.2% dari sisa jarak per 10 detik)
      // Ini bakal butuh waktu puluhan menit agar sampai, jauh lebih realistis.
      this.trip.latitude += latDiff * 0.002 + (Math.random() - 0.5) * 0.0001;
      this.trip.longitude += lngDiff * 0.002 + (Math.random() - 0.5) * 0.0001;
    }

    this.api.post(`trips/${this.tripId}/location`, {
      latitude: this.trip.latitude,
      longitude: this.trip.longitude
    }).subscribe({
      next: () => {
        this.lastUpdateTime = new Date().toLocaleTimeString('id-ID');
      },
      error: (err) => console.error('Location sync failed', err)
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
