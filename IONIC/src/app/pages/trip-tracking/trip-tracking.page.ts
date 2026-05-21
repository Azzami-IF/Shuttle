import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';

declare var L: any;

@Component({
  standalone: false,
  selector: 'app-trip-tracking',
  templateUrl: './trip-tracking.page.html',
  styleUrls: ['./trip-tracking.page.scss'],
})
export class TripTrackingPage implements OnDestroy, AfterViewInit {
  tripId: any;
  trip: any;
  location: any;
  pollingInterval: any;
  map: any;
  shuttleMarker: any;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService
  ) {}

  ionViewWillEnter() {
    this.tripId = this.route.snapshot.paramMap.get('id');
    this.loadTrip();
  }

  ngAfterViewInit() {
    this.initMap();
  }

  ngOnDestroy() {
    if (this.pollingInterval) clearInterval(this.pollingInterval);
  }

  initMap() {
    // Default center (e.g., Jakarta)
    this.map = L.map('map').setView([-6.2088, 106.8456], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.startPolling();
  }

  loadTrip() {
    this.api.get(`trips/${this.tripId}`).subscribe(res => {
      this.trip = res;
    });
  }

  startPolling() {
    this.pollingInterval = setInterval(() => {
      this.api.get(`trips/${this.tripId}/latest-location`).subscribe(res => {
        if (res && res.latitude && res.longitude) {
          this.location = res;
          this.updateMarker(res.latitude, res.longitude);
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
}
