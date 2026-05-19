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
  credentials = {
    email: '',
    password: ''
  };
  showPassword = false;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  onLogin() {
    this.auth.login(this.credentials).subscribe({
      next: (res) => {
        console.log('Login success', res);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Login failed', err);
        alert('Login failed: ' + (err.error?.message || 'Unknown error'));
      }
    });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
