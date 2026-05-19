import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  standalone: false,
  selector: 'app-trip-tracking',
  templateUrl: './trip-tracking.page.html',
  styleUrls: ['./trip-tracking.page.scss'],
})
export class TripTrackingPage implements OnInit, OnDestroy {
  tripId: any;
  trip: any;
  location: any;
  pollingInterval: any;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService
  ) {}

  ngOnInit() {
    this.tripId = this.route.snapshot.paramMap.get('id');
    this.loadTrip();
    this.startPolling();
  }

  ngOnDestroy() {
    if (this.pollingInterval) clearInterval(this.pollingInterval);
  }

  loadTrip() {
    this.api.get(`trips/${this.tripId}`).subscribe(res => {
      this.trip = res;
    });
  }

  startPolling() {
    this.pollingInterval = setInterval(() => {
      this.api.get(`trips/${this.tripId}/latest-location`).subscribe(res => {
        this.location = res;
      });
    }, 5000); // Every 5 seconds
  }
}
