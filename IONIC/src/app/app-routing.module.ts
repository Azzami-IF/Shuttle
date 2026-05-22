import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule),
    canActivate: [AuthGuard]
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
    loadChildren: () => import('./pages/dashboard/dashboard.module').then( m => m.DashboardPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'schedule-list',
    loadChildren: () => import('./pages/schedule-list/schedule-list.module').then( m => m.ScheduleListPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'seat-selection',
    loadChildren: () => import('./pages/seat-selection/seat-selection.module').then( m => m.SeatSelectionPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'driver-trips',
    loadChildren: () => import('./pages/driver-trips/driver-trips.module').then( m => m.DriverTripsPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'trip-tracking',
    loadChildren: () => import('./pages/trip-tracking/trip-tracking.module').then( m => m.TripTrackingPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'booking-detail',
    loadChildren: () => import('./pages/booking-detail/booking-detail.module').then( m => m.BookingDetailPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'onboarding',
    loadChildren: () => import('./pages/onboarding/onboarding.module').then( m => m.OnboardingPageModule)
  },
  {
    path: 'payment',
    loadChildren: () => import('./pages/payment/payment.module').then( m => m.PaymentPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'driver-history',
    loadChildren: () => import('./pages/driver-history/driver-history.module').then( m => m.DriverHistoryPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'driver-dashboard',
    loadChildren: () => import('./pages/driver-dashboard/driver-dashboard.module').then( m => m.DriverDashboardPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'driver-tracking',
    loadChildren: () => import('./pages/driver-tracking/driver-tracking.module').then( m => m.DriverTrackingPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'driver-status',
    loadChildren: () => import('./pages/driver-status/driver-status.module').then( m => m.DriverStatusPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'driver-vehicle',
    loadChildren: () => import('./pages/driver-vehicle/driver-vehicle.module').then( m => m.DriverVehiclePageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'driver-profile',
    loadChildren: () => import('./pages/driver-profile/driver-profile.module').then( m => m.DriverProfilePageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadChildren: () => import('./pages/profile/profile.module').then( m => m.ProfilePageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'driver-login',
    loadChildren: () => import('./pages/driver-login/driver-login.module').then( m => m.DriverLoginPageModule)
  },
  {
    path: '',
    redirectTo: 'onboarding',
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
