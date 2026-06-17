import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { UiService } from '../../services/ui.service';
import { LanguageService } from '../../services/language.service';

declare var L: any;

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
  map: any;
  shuttleMarker: any;
  routeCoordinates: any[] = [];
  currentRouteIndex: number = 0;
  shiftTimer: string = '03:24:15';
  passengerCount = 0;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private router: Router,
    private ui: UiService,
    public langService: LanguageService
  ) {}

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
      if (res && ['boarding', 'on-going', 'delayed', 'arrived'].includes(res.status)) {
        this.startLocationUpdates();
      } else {
        this.stopLocationUpdates();
      }
      
      // Load passengers only after trip data is available
      if (this.trip && this.trip.schedule_id) {
        this.loadPassengers();
      }

      // Initialize map once trip is loaded
      setTimeout(() => this.initMap(), 100);
    });
  }

  initMap() {
    if (this.map) return;
    
    this.map = L.map('driver-map').setView([-6.2088, 106.8456], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.drawRoute();
  }

  drawRoute() {
    if (!this.map || !this.trip?.schedule) return;

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

    const originCoords = coordinatesMap[originName] || [-6.9452, 107.5937];
    const destCoords = coordinatesMap[destName] || [-6.3090, 106.8824];

    // Origin Marker
    const originIcon = L.divIcon({
      className: 'route-marker-icon origin',
      html: `<div style="background-color:#536349; color:white; padding:4px 8px; border-radius:8px; font-weight:bold; font-size:10px; border:1px solid white; white-space:nowrap; box-shadow:0 2px 5px rgba(0,0,0,0.3);">
               Asal: ${this.trip.schedule.origin}
             </div>`,
      iconSize: [80, 24],
      iconAnchor: [40, 12]
    });
    L.marker(originCoords, { icon: originIcon }).addTo(this.map);

    // Destination Marker
    const destIcon = L.divIcon({
      className: 'route-marker-icon destination',
      html: `<div style="background-color:#d9534f; color:white; padding:4px 8px; border-radius:8px; font-weight:bold; font-size:10px; border:1px solid white; white-space:nowrap; box-shadow:0 2px 5px rgba(0,0,0,0.3);">
               Tujuan: ${this.trip.schedule.destination}
             </div>`,
      iconSize: [80, 24],
      iconAnchor: [40, 12]
    });
    L.marker(destCoords, { icon: destIcon }).addTo(this.map);

    // Fetch OSRM Route Geometry
    const lng1 = originCoords[1];
    const lat1 = originCoords[0];
    const lng2 = destCoords[1];
    const lat2 = destCoords[0];

    fetch(`https://router.project-osrm.org/route/v1/driving/${lng1},${lat1};${lng2},${lat2}?overview=full&geometries=geojson`)
      .then(res => res.json())
      .then(data => {
        if (data.routes && data.routes.length > 0) {
          this.routeCoordinates = data.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]]);
          
          L.polyline(this.routeCoordinates, {
            color: '#536349', weight: 4, opacity: 0.7, dashArray: '5, 10'
          }).addTo(this.map);
          this.map.fitBounds(L.polyline(this.routeCoordinates).getBounds(), { padding: [30, 30] });

          if (!this.trip.latitude || this.trip.latitude == 0) {
            this.trip.latitude = this.routeCoordinates[0][0];
            this.trip.longitude = this.routeCoordinates[0][1];
          } else {
            let minD = Infinity;
            let minI = 0;
            this.routeCoordinates.forEach((c, i) => {
               const d = Math.pow(c[0] - this.trip.latitude, 2) + Math.pow(c[1] - this.trip.longitude, 2);
               if(d < minD) { minD = d; minI = i; }
            });
            this.currentRouteIndex = minI;
          }
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

    if (this.routeCoordinates.length > 0) {
      if (this.currentRouteIndex < this.routeCoordinates.length - 1) {
        this.currentRouteIndex += 3; // Simulate fast movement along road
        if (this.currentRouteIndex >= this.routeCoordinates.length) {
          this.currentRouteIndex = this.routeCoordinates.length - 1;
        }
        const coord = this.routeCoordinates[this.currentRouteIndex];
        this.trip.latitude = coord[0];
        this.trip.longitude = coord[1];
      }
    }

    this.api.post(`trips/${this.tripId}/location`, {
      latitude: this.trip.latitude,
      longitude: this.trip.longitude
    }).subscribe({
      next: () => {
        this.lastUpdateTime = new Date().toLocaleTimeString('id-ID');
        this.updateMarkerOnMap(this.trip.latitude, this.trip.longitude);
      },
      error: (err) => console.error('Location sync failed', err)
    });
  }

  updateMarkerOnMap(lat: number, lng: number) {
    if (!this.map) return;

    if (!this.shuttleMarker) {
      const busIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color:#18281e; color:white; padding:6px; border-radius:50%; border:2px solid white; box-shadow:0 0 8px rgba(0,0,0,0.5);">
                 <i class="material-symbols-outlined" style="font-size:16px;">directions_bus</i>
               </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });
      this.shuttleMarker = L.marker([lat, lng], { icon: busIcon }).addTo(this.map);
    } else {
      this.shuttleMarker.setLatLng([lat, lng]);
    }
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
