import { Component, OnInit, OnDestroy, AfterViewInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { UiService } from '../../services/ui.service';
import { LanguageService } from '../../services/language.service';
import { LocationService } from '../../services/location.service';
import * as L from 'leaflet';
import { Subscription } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-driver-tracking',
  templateUrl: './driver-tracking.page.html',
  styleUrls: ['./driver-tracking.page.scss'],
})
export class DriverTrackingPage implements OnInit, OnDestroy, AfterViewInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private router = inject(Router);
  private ui = inject(UiService);
  langService = inject(LanguageService);
  locationService = inject(LocationService);

  tripId: any;
  trip: any;
  passengers: any[] = [];
  gpsStatus: string = 'Menunggu...';
  lastUpdateTime: string = '';
  metrics = {
    fuel: 88,
    temp: 'Normal'
  };
  shiftTimer: string = '03:24:15';
  passengerCount = 0;

  map: L.Map | null = null;
  marker: L.Marker | null = null;
  locationSub: Subscription | null = null;

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

  ngAfterViewInit() {
    setTimeout(() => {
      this.initMap();
    }, 500);
  }

  ngOnDestroy() {
    this.stopLocationUpdates();
    if (this.map) {
      this.map.remove();
    }
  }

  initMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    // Initialize Leaflet map
    this.map = L.map('map').setView([-6.200000, 106.816666], 13); // Default to Jakarta
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    // Custom bus icon
    const icon = L.icon({
      iconUrl: 'assets/icon/favicon.png', // Temporary fallback, you can add a real marker image later
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    this.marker = L.marker([-6.200000, 106.816666], { icon }).addTo(this.map);
  }

  loadTrip() {
    this.api.get(`trips/${this.tripId}`).subscribe((res: any) => {
      this.trip = res;
      if (res && res.status === 'on-going') {
        this.startLocationUpdates();
      } else {
        this.stopLocationUpdates();
      }
      
      if (this.trip && this.trip.schedule_id) {
        this.loadPassengers();
      }
    });
  }

  async startLocationUpdates() {
    const hasPermission = await this.locationService.requestPermissions();
    if (!hasPermission) {
      this.gpsStatus = 'Izin lokasi ditolak';
      this.ui.showToast('Gagal memulai GPS. Izin lokasi ditolak.', 'danger');
      return;
    }

    this.gpsStatus = 'Aktif';
    await this.locationService.startTracking();

    if (!this.locationSub) {
      this.locationSub = this.locationService.currentPosition$.subscribe(position => {
        if (position) {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          // Update Map
          if (this.map && this.marker) {
            this.marker.setLatLng([lat, lng]);
            this.map.setView([lat, lng]);
          }

          // Sync to Server
          this.syncLocationToServer(lat, lng);
        }
      });
    }
  }

  async stopLocationUpdates() {
    await this.locationService.stopTracking();
    if (this.locationSub) {
      this.locationSub.unsubscribe();
      this.locationSub = null;
    }
    this.gpsStatus = 'Tidak aktif';
  }

  syncLocationToServer(lat: number, lng: number) {
    if (!this.trip) return;
    this.api.post(`trips/${this.tripId}/location`, {
      latitude: lat,
      longitude: lng
    }).subscribe({
      next: () => {
        this.lastUpdateTime = new Date().toLocaleTimeString('id-ID');
      },
      error: (err) => console.error('Location sync failed', err)
    });
  }

  updateLocation() {
    this.locationService.getCurrentPosition().then(pos => {
      if (pos) {
        this.ui.showToast('Lokasi berhasil diperbarui secara manual', 'success');
      } else {
        this.ui.showToast('Gagal mengambil lokasi saat ini', 'warning');
      }
    });
  }

  loadPassengers() {
    if (!this.trip?.schedule_id) return;
    this.api.get(`bookings?schedule_id=${this.trip.schedule_id}`).subscribe((res: any[]) => {
      this.passengers = res || [];
      this.passengerCount = this.passengers.length;
    });
  }

  startTrip() {
    this.api.post(`trips/${this.tripId}/start`, {}).subscribe({
      next: () => {
        this.ui.showToast('Perjalanan berhasil dimulai!', 'success');
        this.loadTrip();
      },
      error: (err) => {
        const msg = err.error?.message || 'Gagal memulai perjalanan.';
        // Tampilkan pesan alasan kenapa ditolak (misal tidak ada penumpang)
        this.ui.showToast(msg, 'danger');
        if (msg.includes('tidak ada penumpang')) {
          this.loadTrip(); // Refresh agar UI berubah jadi dibatalkan
        }
      }
    });
  }

  updateStatus(status: string) {
    const endpoint = status === 'completed' ? 'complete' : 'status';
    const payload = status === 'completed' ? {} : { status };

    this.api.post(`trips/${this.tripId}/${endpoint}`, payload).subscribe({
      next: () => {
        this.ui.showToast(`Status perjalanan diperbarui ke ${status}`, 'success');
        if (status === 'completed') {
          this.stopLocationUpdates();
        }
        this.loadTrip();
      },
      error: (err) => {
        const msg = err.error?.message || 'Gagal memperbarui status perjalanan';
        this.ui.showToast(msg, 'danger');
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
