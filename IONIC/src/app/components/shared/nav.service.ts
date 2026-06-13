import { Injectable } from '@angular/core';

export interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[];
}

@Injectable({ providedIn: 'root' })
export class NavService {
  private driverItems: NavItem[] = [
    { label: 'Home', icon: 'home', route: '/driver-dashboard' },
    { label: 'Jadwal', icon: 'calendar_month', route: '/driver-trips' },
    { label: 'History', icon: 'history', route: '/driver-history' },
    { label: 'Profile', icon: 'person', route: '/profile' }
  ];

  private customerItems: NavItem[] = [
    { label: 'Home', icon: 'home', route: '/dashboard' },
    { label: 'Jadwal', icon: 'calendar_month', route: '/schedule' },
    { label: 'History', icon: 'history', route: '/history' },
    { label: 'Profile', icon: 'person', route: '/profile' }
  ];

  constructor() {}

  getItems(role?: string): NavItem[] {
    return role === 'driver' ? this.driverItems : this.customerItems;
  }
}
