import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./pages/dashboard/dashboard.module').then( m => m.DashboardPageModule)
  },
  {
    path: 'schedule-list',
    loadChildren: () => import('./pages/schedule-list/schedule-list.module').then( m => m.ScheduleListPageModule)
  },
  {
    path: 'seat-selection',
    loadChildren: () => import('./pages/seat-selection/seat-selection.module').then( m => m.SeatSelectionPageModule)
  },
  {
    path: 'driver-trips',
    loadChildren: () => import('./pages/driver-trips/driver-trips.module').then( m => m.DriverTripsPageModule)
  },
  {
    path: 'trip-tracking',
    loadChildren: () => import('./pages/trip-tracking/trip-tracking.module').then( m => m.TripTrackingPageModule)
  },
  {
    path: 'booking-detail',
    loadChildren: () => import('./pages/booking-detail/booking-detail.module').then( m => m.BookingDetailPageModule)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
