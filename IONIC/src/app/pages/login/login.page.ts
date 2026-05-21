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
    // In a real app, use Location or NavController
    window.history.back();
  }

  continueAsGuest() {
    this.router.navigate(['/home']);
  }
}
