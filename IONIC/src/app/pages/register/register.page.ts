import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: false,
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  registerData = {
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer'
  };
  isLoading = false;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  onRegister(event: Event) {
    event.preventDefault();
    this.isLoading = true;
    this.auth.register(this.registerData).subscribe({
      next: (res) => {
        this.isLoading = false;
        console.log('Registration success', res);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Registration failed', err);
        alert('Registration failed: ' + (err.error?.message || 'Unknown error'));
      }
    });
  }

  goBack() {
    window.history.back();
  }
}
