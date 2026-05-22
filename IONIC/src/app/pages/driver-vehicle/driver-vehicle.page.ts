import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { UiService } from '../../services/ui.service';

@Component({
  standalone: false,
  selector: 'app-driver-vehicle',
  templateUrl: './driver-vehicle.page.html',
  styleUrls: ['./driver-vehicle.page.scss'],
})
export class DriverVehiclePage {
  vehicle: any = {
    name: 'Ambatu Express 01',
    license_plate: 'B 1234 ABC',
    capacity: 12,
    fuel: 88,
    maintenance: 'Ready',
    last_service: '2023-10-15'
  };

  constructor(private api: ApiService, private ui: UiService) {}

  ionViewWillEnter() {
    // In a real app, fetch assigned vehicle from API
  }

  showPending() {
    this.ui.showFeaturePending();
  }
}
