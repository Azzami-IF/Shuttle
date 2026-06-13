import { Component, OnInit, OnDestroy, AfterViewInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { UiService } from '../../services/ui.service';

declare var L: any;

@Component({
  standalone: false,
  selector: 'app-trip-tracking',
  templateUrl: './trip-tracking.page.html',
  styleUrls: ['./trip-tracking.page.scss'],
})
export class TripTrackingPage implements OnDestroy, AfterViewInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private ui = inject(UiService);
  private router = inject(Router);
  private auth = inject(AuthService);

  tripId: any;
  trip: any;
  location: any;
  pollingInterval: any;
  statusPollingInterval: any;
  map: any;
  shuttleMarker: any;
  previousStatus: string = '';
  eta: number = 0;
  homeRoute = '/dashboard';

  constructor() {}

  ionViewWillEnter() {
    this.homeRoute = this.auth.getHomeRoute();
    this.tripId = this.route.snapshot.paramMap.get('id');
    this.loadTrip();
  }

  ngAfterViewInit() {
    this.initMap();
  }

  ngOnDestroy() {
    if (this.pollingInterval) clearInterval(this.pollingInterval);
    if (this.statusPollingInterval) clearInterval(this.statusPollingInterval);
  }

  initMap() {
    // Default center (e.g., Jakarta)
    this.map = L.map('map').setView([-6.2088, 106.8456], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.drawRoute();
    this.startPolling();
    this.startStatusPolling();
  }

  loadTrip() {
    this.api.get(`trips/${this.tripId}`).subscribe({
      next: (res) => {
        this.trip = res;
        this.previousStatus = res.status;
        this.drawRoute();
      },
      error: (err) => {
        console.error('Error loading trip', err);
        this.ui.showToast('Perjalanan tidak ditemukan atau tidak dapat diakses', 'danger');
        this.router.navigate([this.homeRoute], { replaceUrl: true });
      }
    });
  }

  drawRoute() {
    if (!this.map || !this.trip?.schedule) return;

    const originName = (this.trip.schedule.origin || '').toLowerCase().trim();
    const destName = (this.trip.schedule.destination || '').toLowerCase().trim();

    const coordinatesMap: { [key: string]: [number, number] } = {
      'jakarta': [-6.3090, 106.8824],
      'terminal kampung rambutan': [-6.3090, 106.8824],
      'bandung': [-6.9452, 107.5937],
      'terminal leuwi panjang': [-6.9452, 107.5937],
      'karawang': [-6.3073, 107.2913],
      'sumedang': [-6.8524, 107.9234],
      'subang': [-6.5715, 107.7587],
      'purwakarta': [-6.5571, 107.4431]
    };

    const originCoords = coordinatesMap[originName] || coordinatesMap['bandung'];
    const destCoords = coordinatesMap[destName] || coordinatesMap['jakarta'];

    // Add Origin Marker
    const originIcon = L.divIcon({
      className: 'route-marker-icon origin',
      html: `<div style="background-color:#536349; color:white; padding:6px 10px; border-radius:12px; font-weight:bold; font-size:11px; border:1px solid white; white-space:nowrap; box-shadow:0 2px 5px rgba(0,0,0,0.3);">
               Asal: ${this.trip.schedule.origin}
             </div>`,
      iconSize: [80, 24],
      iconAnchor: [40, 12]
    });
    L.marker(originCoords, { icon: originIcon }).addTo(this.map);

    // Add Destination Marker
    const destIcon = L.divIcon({
      className: 'route-marker-icon destination',
      html: `<div style="background-color:#d9534f; color:white; padding:6px 10px; border-radius:12px; font-weight:bold; font-size:11px; border:1px solid white; white-space:nowrap; box-shadow:0 2px 5px rgba(0,0,0,0.3);">
               Tujuan: ${this.trip.schedule.destination}
             </div>`,
      iconSize: [80, 24],
      iconAnchor: [40, 12]
    });
    L.marker(destCoords, { icon: destIcon }).addTo(this.map);

    // Draw Polyline (Route path)
    L.polyline([originCoords, destCoords], {
      color: '#536349',
      weight: 4,
      opacity: 0.7,
      dashArray: '5, 10'
    }).addTo(this.map);

    // Fit map bounds to show both
    this.map.fitBounds([originCoords, destCoords], { padding: [50, 50] });
  }

  startPolling() {
    this.pollingInterval = setInterval(() => {
      this.api.get(`trips/${this.tripId}/latest-location`).subscribe({
        next: (res) => {
          if (res && res.latitude && res.longitude) {
            this.location = res;
            this.updateMarker(res.latitude, res.longitude);
          }
        },
        error: (err) => {
          console.error('Error fetching location', err);
          // Don't show error on every poll for location data
        }
      });
    }, 5000); // Every 5 seconds
  }

  updateMarker(lat: number, lng: number) {
    if (!this.map) return;

    if (!this.shuttleMarker) {
      const busIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color:#18281e; color:white; padding:8px; border-radius:50%; border:2px solid white; box-shadow:0 0 10px rgba(0,0,0,0.5);">
                 <i class="material-symbols-outlined" style="font-size:20px;">directions_bus</i>
               </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });
      this.shuttleMarker = L.marker([lat, lng], { icon: busIcon }).addTo(this.map);
    } else {
      this.shuttleMarker.setLatLng([lat, lng]);
    }

    this.map.panTo([lat, lng]);
  }

  startStatusPolling() {
    this.statusPollingInterval = setInterval(() => {
      this.api.get(`trips/${this.tripId}`).subscribe({
        next: (res) => {
          if (res && res.status !== this.previousStatus) {
            this.previousStatus = res.status;
            this.showStatusNotification(res.status);
          }
          this.trip = res;
        },
        error: (err) => {
          console.error('Error polling trip status', err);
          // Don't show error on every poll, just log it
        }
      });
    }, 5000); // Every 5 seconds
  }

  showStatusNotification(status: string) {
    const messages: { [key: string]: string } = {
      'scheduled': 'Perjalanan dijadwalkan',
      'boarding': 'Bus sedang naik penumpang',
      'on-going': 'Bus sedang dalam perjalanan',
      'arrived': 'Bus telah tiba di tujuan',
      'delayed': 'Bus mengalami keterlambatan',
      'completed': 'Perjalanan telah selesai'
    };

    const message = messages[status] || `Status: ${status}`;
    this.ui.showToast(message);
  }

  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      'scheduled': 'badge-info',
      'boarding': 'badge-warning',
      'on-going': 'badge-success',
      'arrived': 'badge-primary',
      'delayed': 'badge-danger',
      'completed': 'badge-secondary'
    };
    return classes[status] || 'badge-secondary';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'scheduled': 'Dijadwalkan',
      'boarding': 'Naik Penumpang',
      'on-going': 'Dalam Perjalanan',
      'arrived': 'Tiba',
      'delayed': 'Terlambat',
      'completed': 'Selesai'
    };
    return labels[status] || status;
  }

  calculateETA(): number {
    if (!this.trip?.schedule?.departure_time) return 0;

    const departure = new Date(this.trip.schedule.departure_time).getTime();
    const now = new Date().getTime();
    const duration = 120; // Assume 2 hours for Jakarta-Bandung
    const estimatedArrival = departure + (duration * 60 * 1000);
    const remaining = Math.max(0, estimatedArrival - now);

    return Math.ceil(remaining / (60 * 1000)); // Convert to minutes
  }

  formatETATime(minutes: number): string {
    if (minutes <= 0) return 'Tiba sekarang';
    if (minutes < 60) return `${minutes} menit lagi`;
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
      return `${hours} jam lagi`;
    }
    return `${hours}j ${mins}m lagi`;
  }
}
