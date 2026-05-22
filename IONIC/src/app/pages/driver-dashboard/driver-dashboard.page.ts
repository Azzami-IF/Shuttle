import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UiService } from '../../services/ui.service';

@Component({
  standalone: false,
  selector: 'app-driver-dashboard',
  templateUrl: './driver-dashboard.page.html',
  styleUrls: ['./driver-dashboard.page.scss'],
})
export class DriverDashboardPage {
  user$ = this.auth.user$;

  constructor(
    private auth: AuthService,
    private router: Router,
    private ui: UiService
  ) {}

  ionViewWillEnter() {
    console.log('Driver Dashboard will enter');
  }

  showPending() {
    this.ui.showFeaturePending();
  }

  logout() {
    this.auth.logout().subscribe({
      next: () => {
        this.router.navigate(['/driver-login'], { replaceUrl: true });
      },
      error: (err) => {
        console.error('Logout failed', err);
        this.router.navigate(['/driver-login'], { replaceUrl: true });
      }
    });
  }
}
