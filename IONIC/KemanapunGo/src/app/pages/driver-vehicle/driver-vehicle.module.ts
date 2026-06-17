import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DriverVehiclePageRoutingModule } from './driver-vehicle-routing.module';
import { DriverVehiclePage } from './driver-vehicle.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DriverVehiclePageRoutingModule
  ],
  declarations: [DriverVehiclePage]
})
export class DriverVehiclePageModule {}
