import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UiService } from '../../services/ui.service';

@Component({
  standalone: false,
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage {
  user$ = this.auth.user$;

  constructor(
    private auth: AuthService,
    private router: Router,
    private ui: UiService
  ) {}

  ionViewWillEnter() {
    console.log('Profile will enter');
  }

  showPending() {
    this.ui.showFeaturePending();
  }

  logout() {
    this.auth.logout().subscribe({
      next: () => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const loginPath = user.role === 'driver' ? '/driver-login' : '/login';
        this.router.navigate([loginPath], { replaceUrl: true });
      },
      error: (err) => {
        console.error('Logout failed', err);
        this.router.navigate(['/login'], { replaceUrl: true });
      }
    });
  }
}
