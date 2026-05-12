import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  user = {
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer'
  };

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  onRegister() {
    this.auth.register(this.user).subscribe({
      next: (res) => {
        console.log('Registration success', res);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Registration failed', err);
        alert('Registration failed: ' + (err.error?.message || 'Unknown error'));
      }
    });
  }
}
