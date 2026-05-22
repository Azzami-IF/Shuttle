import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DriverStatusPageRoutingModule } from './driver-status-routing.module';
import { DriverStatusPage } from './driver-status.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DriverStatusPageRoutingModule
  ],
  declarations: [DriverStatusPage]
})
export class DriverStatusPageModule {}
