import { Component, inject } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { UiService } from '../../services/ui.service';

@Component({
  standalone: false,
  selector: 'app-driver-vehicle',
  templateUrl: './driver-vehicle.page.html',
  styleUrls: ['./driver-vehicle.page.scss'],
})
export class DriverVehiclePage {
  private api = inject(ApiService);
  private ui = inject(UiService);

  vehicle: any = {
    name: 'Kemanapun Express 01',
    license_plate: 'B 1234 ABC',
    capacity: 12,
    fuel: 88,
    maintenance: 'Ready',
    last_service: '2023-10-15'
  };

  constructor() {}

  ionViewWillEnter() {
    this.api.get('vehicles').subscribe({
      next: (res: any) => {
        if (res && res.length > 0) {
          const v = res[0];
          this.vehicle = {
            name: v.name,
            license_plate: v.license_plate,
            capacity: v.capacity,
            fuel: 92,
            maintenance: 'Siap Beroperasi',
            last_service: '2026-05-10'
          };
        }
      },
      error: (err) => {
        console.error('Error fetching vehicles', err);
      }
    });
  }

  showPending() {
    this.ui.showFeaturePending();
  }
}
