import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ScheduleListPageRoutingModule } from './schedule-list-routing.module';
import { ScheduleListPage } from './schedule-list.page';
import { ScheduleSearchComponent } from '../../components/schedule-search/schedule-search.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ScheduleListPageRoutingModule,
    ScheduleSearchComponent
  ],
  declarations: [ScheduleListPage]
})
export class ScheduleListPageModule {}
