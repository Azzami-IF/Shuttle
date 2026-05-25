import { Injectable } from '@angular/core';
import { ToastController, LoadingController, AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class UiService {
  constructor(
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {}

  async showToast(message: string, color: string = 'dark', duration: number = 2000) {
    const toast = await this.toastCtrl.create({
      message,
      duration,
      color,
      position: 'bottom',
      buttons: [{ text: 'OK', role: 'cancel' }]
    });
    await toast.present();
  }

  async showFeaturePending() {
    await this.showToast('Fitur ini akan segera tersedia!', 'primary');
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  async showConfirm(header: string, message: string, confirmText: string = 'Logout') {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: [
        { text: 'Batal', role: 'cancel' },
        { text: confirmText, role: 'confirm' }
      ]
    });

    await alert.present();
    const { role } = await alert.onDidDismiss();
    return role === 'confirm';
  }

  getErrorMessage(error: any, fallback: string) {
    if (!error) {
      return fallback;
    }

    const rawMessage = error?.error?.message;
    if (typeof rawMessage === 'string' && rawMessage.trim()) {
      return rawMessage;
    }

    const errors = error?.error?.errors;
    if (errors && typeof errors === 'object') {
      const firstKey = Object.keys(errors)[0];
      const firstValue = firstKey ? errors[firstKey] : null;
      if (Array.isArray(firstValue) && firstValue.length > 0) {
        return String(firstValue[0]);
      }
      if (typeof firstValue === 'string' && firstValue.trim()) {
        return firstValue;
      }
    }

    if (typeof error?.message === 'string' && error.message.trim()) {
      return error.message;
    }

    return fallback;
  }

  async showLoading(message: string = 'Mohon tunggu...') {
    const loading = await this.loadingCtrl.create({
      message,
      spinner: 'crescent'
    });
    await loading.present();
    return loading;
  }
}
