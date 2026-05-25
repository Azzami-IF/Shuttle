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
  homeRoute = '/dashboard';
  isEditingProfile = false;
  isChangingPassword = false;
  profileData = { name: '', phone: '' };
  passwordData = { old_password: '', new_password: '' };
  isLoading = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private ui: UiService
  ) {}

  ionViewWillEnter() {
    console.log('Profile will enter');
    this.homeRoute = this.auth.getRole() === 'driver' ? '/driver-dashboard' : '/dashboard';
  }

  showPending() {
    this.ui.showFeaturePending();
  }

  openEditProfile(user: any) {
    this.profileData.name = user.name || '';
    this.profileData.phone = user.phone || '';
    this.isEditingProfile = true;
  }

  saveProfile() {
    this.isLoading = true;
    this.auth.updateProfile(this.profileData).subscribe({
      next: () => {
        this.isLoading = false;
        this.isEditingProfile = false;
        void this.ui.showToast('Profil berhasil diperbarui!', 'success');
      },
      error: (err) => {
        this.isLoading = false;
        void this.ui.showAlert('Gagal memperbarui profil', this.ui.getErrorMessage(err, 'Error'));
      }
    });
  }

  openChangePassword() {
    this.passwordData.old_password = '';
    this.passwordData.new_password = '';
    this.isChangingPassword = true;
  }

  savePassword() {
    if (this.passwordData.new_password.length < 8) {
      void this.ui.showToast('Kata sandi baru minimal 8 karakter!', 'warning');
      return;
    }
    this.isLoading = true;
    this.auth.changePassword(this.passwordData).subscribe({
      next: () => {
        this.isLoading = false;
        this.isChangingPassword = false;
        void this.ui.showToast('Kata sandi berhasil diperbarui!', 'success');
      },
      error: (err) => {
        this.isLoading = false;
        void this.ui.showAlert('Gagal mengganti kata sandi', this.ui.getErrorMessage(err, 'Sandi lama salah'));
      }
    });
  }

  async confirmLogout() {
    const confirmed = await this.ui.showConfirm('Logout', 'Anda akan keluar dari sesi ini. Lanjutkan?');
    if (!confirmed) {
      return;
    }

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
