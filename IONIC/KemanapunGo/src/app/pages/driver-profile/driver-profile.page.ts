import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UiService } from '../../services/ui.service';

@Component({
  standalone: false,
  selector: 'app-driver-profile',
  templateUrl: './driver-profile.page.html',
  styleUrls: ['./driver-profile.page.scss'],
})
export class DriverProfilePage {
  user$ = this.auth.user$;

  constructor(
    private auth: AuthService,
    private router: Router,
    private ui: UiService
  ) {}

  showPending() {
    this.ui.showFeaturePending();
  }

  async confirmLogout() {
    const confirmed = await this.ui.showConfirm('Logout', 'Anda akan keluar dari akun driver ini. Lanjutkan?');
    if (!confirmed) {
      return;
    }

    this.auth.logout().subscribe({
      next: () => {
        this.router.navigate(['/driver-login'], { replaceUrl: true });
      },
      error: () => {
        this.router.navigate(['/driver-login'], { replaceUrl: true });
      }
    });
  }
}
