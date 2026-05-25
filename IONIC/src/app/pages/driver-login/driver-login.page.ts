import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UiService } from '../../services/ui.service';

@Component({
  standalone: false,
  selector: 'app-driver-login',
  templateUrl: './driver-login.page.html',
  styleUrls: ['./driver-login.page.scss'],
})
export class DriverLoginPage {
  loginData = {
    email: '',
    password: ''
  };
  showPassword = false;
  isLoading = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private ui: UiService
  ) {}

  onLogin(event: Event) {
    event.preventDefault();
    if (!this.loginData.email || !this.loginData.password) {
      this.ui.showToast('Mohon isi email dan kata sandi', 'warning');
      return;
    }
    this.isLoading = true;
    this.auth.login(this.loginData).subscribe({
      next: (res) => {
        this.isLoading = false;

        // Role check: Only drivers can login through this page
        if (res.user.role !== 'driver') {
          this.ui.showAlert('Akses Ditolak', 'Gunakan portal Penumpang untuk akun pelanggan.');
          this.auth.logoutDirect();
          return;
        }

        console.log('Driver login success', res);
        this.router.navigate(['/driver-dashboard'], { replaceUrl: true });
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Driver login failed', err);
        const msg = this.ui.getErrorMessage(err, 'Login gagal. Cek kembali akun Driver Anda.');
        this.ui.showAlert('Gagal', msg);
      }
    });
  }

  goToPassengerLogin() {
    this.router.navigate(['/login']);
  }
}
