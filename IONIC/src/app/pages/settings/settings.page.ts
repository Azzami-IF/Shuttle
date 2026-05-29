import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { ThemeService, ThemeMode } from '../../services/theme.service';
import { ApiService } from '../../services/api.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  standalone: false,
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit, OnDestroy {
  user: any = null;
  loading = false;
  themeMode: ThemeMode = 'light';
  useSystemPreference = true;
  
  // Edit profile form
  editingProfile = false;
  editName = '';
  editEmail = '';
  editPhone = '';
  
  // Change password form
  editingPassword = false;
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private auth: AuthService,
    private themeService: ThemeService,
    private api: ApiService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadThemeSettings();
  }

  /**
   * Load user profile
   */
  private loadUserProfile(): void {
    this.auth.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.user = user;
        if (user) {
          this.editName = user.name || '';
          this.editEmail = user.email || '';
          this.editPhone = user.phone || '';
        }
      });
  }

  /**
   * Load theme settings
   */
  private loadThemeSettings(): void {
    this.themeService.theme$
      .pipe(takeUntil(this.destroy$))
      .subscribe(theme => {
        this.themeMode = theme;
      });

    this.themeService.settings$
      .pipe(takeUntil(this.destroy$))
      .subscribe(settings => {
        this.useSystemPreference = settings.useSystemPreference;
      });
  }

  /**
   * Toggle theme between light and dark
   */
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  /**
   * Set theme mode
   */
  setTheme(mode: ThemeMode): void {
    this.themeService.setTheme(mode);
  }

  /**
   * Toggle system preference
   */
  toggleSystemPreference(): void {
    this.themeService.setSystemPreference(!this.useSystemPreference);
  }

  /**
   * Edit profile button click
   */
  startEditingProfile(): void {
    this.editingProfile = true;
  }

  /**
   * Cancel profile edit
   */
  cancelEditProfile(): void {
    this.editingProfile = false;
    this.editName = this.user?.name || '';
    this.editEmail = this.user?.email || '';
    this.editPhone = this.user?.phone || '';
  }

  /**
   * Save profile changes
   */
  async saveProfile(): Promise<void> {
    if (!this.editName.trim()) {
      this.showToast('Nama tidak boleh kosong');
      return;
    }

    this.loading = true;
    this.api.post('profile/update', {
      name: this.editName,
      email: this.editEmail,
      phone: this.editPhone,
    }).subscribe(
      (response: any) => {
        this.showToast('Profil berhasil diperbarui');
        this.editingProfile = false;
        // User data refreshed from API
        this.loading = false;
      },
      (error) => {
        this.showToast(error.error?.message || 'Gagal memperbarui profil');
        this.loading = false;
      }
    );
  }

  /**
   * Edit password button click
   */
  startEditingPassword(): void {
    this.editingPassword = true;
  }

  /**
   * Cancel password edit
   */
  cancelEditPassword(): void {
    this.editingPassword = false;
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }

  /**
   * Save password change
   */
  async savePassword(): Promise<void> {
    if (!this.currentPassword.trim()) {
      this.showToast('Masukkan password saat ini');
      return;
    }

    if (!this.newPassword.trim() || this.newPassword.length < 8) {
      this.showToast('Password baru minimal 8 karakter');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.showToast('Konfirmasi password tidak cocok');
      return;
    }

    this.loading = true;
    this.api.post('profile/password', {
      current_password: this.currentPassword,
      password: this.newPassword,
      password_confirmation: this.confirmPassword,
    }).subscribe(
      (response: any) => {
        this.showToast('Password berhasil diubah');
        this.editingPassword = false;
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.loading = false;
      },
      (error) => {
        this.showToast(error.error?.message || 'Gagal mengubah password');
        this.loading = false;
      }
    );
  }

  /**
   * Open contact us
   */
  async openContactUs(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Hubungi Kami',
      message: `
        <div style="text-align: left; line-height: 1.8;">
          <p><strong>Email:</strong> support@shuttle.local</p>
          <p><strong>WhatsApp:</strong> +62 812 3456 7890</p>
          <p><strong>Jam Operasional:</strong> 08:00 - 22:00 WIB</p>
          <p style="font-size: 0.9em; color: #666; margin-top: 1rem;">
            Kami siap membantu Anda 24/7 untuk pertanyaan dan keluhan.
          </p>
        </div>
      `,
      buttons: [
        {
          text: 'Email',
          handler: () => {
            window.open('mailto:support@shuttle.local');
          }
        },
        {
          text: 'WhatsApp',
          handler: () => {
            window.open('https://wa.me/6281234567890');
          }
        },
        {
          text: 'Tutup',
          role: 'cancel'
        }
      ]
    });

    await alert.present();
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Konfirmasi Logout',
      message: 'Apakah Anda yakin ingin keluar dari aplikasi?',
      buttons: [
        {
          text: 'Batal',
          role: 'cancel',
        },
        {
          text: 'Logout',
          role: 'destructive',
          handler: () => {
            this.auth.logout().subscribe(() => {
              this.router.navigate(['/login']);
            });
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Open about page
   */
  openAbout(): void {
    this.router.navigate(['/about']);
  }

  /**
   * Show toast message
   */
  private async showToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
    });
    await toast.present();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
