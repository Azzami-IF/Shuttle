import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  loginData = {
    email: '',
    password: ''
  };
  showPassword = false;
  isLoading = false;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  onLogin(event: Event) {
    event.preventDefault();
    if (!this.loginData.email || !this.loginData.password) {
      alert('Mohon isi email dan kata sandi');
      return;
    }
    this.isLoading = true;
    this.auth.login(this.loginData).subscribe({
      next: (res) => {
        this.isLoading = false;

        // Role check: Only customers can login through this page
        if (res.user.role !== 'customer') {
          alert('Akses Ditolak: Gunakan portal Driver untuk akun pengemudi.');
          this.auth.logoutDirect(); // Method to clear local storage without API call
          return;
        }

        console.log('Login success', res);
        this.router.navigate(['/dashboard'], { replaceUrl: true });
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Login failed', err);
        const msg = err.error?.message || 'Login gagal. Cek kembali akun Anda.';
        alert(msg);
      }
    });
  }

  goBack() {
    this.router.navigate(['/onboarding'], { replaceUrl: true });
  }

  goToDriverLogin() {
    this.router.navigate(['/driver-login']);
  }

  continueAsGuest() {
    this.router.navigate(['/dashboard']);
  }
}
