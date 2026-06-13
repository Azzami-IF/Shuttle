import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { AlertController, ToastController } from '@ionic/angular';

@Component({
  standalone: false,
  selector: 'app-driver-trips',
  templateUrl: './driver-trips.page.html',
  styleUrls: ['./driver-trips.page.scss'],
})
export class DriverTripsPage {
  user$ = this.auth.user$;
  trips: any[] = [];
  nextTrip: any = null;
  laterTrips: any[] = [];
  filteredLaterTrips: any[] = [];
  activeTrip: any = null;
  today = new Date();
  searchTerm: string = '';
  isStarting = false;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  ionViewWillEnter() {
    this.loadTrips();
  }

  loadTrips() {
    this.api.get('trips').subscribe((res: any[]) => {
      this.trips = res;
      this.activeTrip = this.trips.find(t => t.status === 'on-going');

      const upcomingTrips = this.trips
        .filter(t => t.status === 'scheduled' || t.status === 'cancelled_empty')
        .sort((a, b) => new Date(a.schedule.departure_time).getTime() - new Date(b.schedule.departure_time).getTime());

      if (upcomingTrips.length > 0) {
        this.nextTrip = upcomingTrips.find(t => t.status === 'scheduled') || null;
        this.laterTrips = upcomingTrips.filter(t => t !== this.nextTrip);
        this.applySearch();
      } else {
        this.nextTrip = null;
        this.laterTrips = [];
        this.filteredLaterTrips = [];
      }
    });
  }

  applySearch() {
    const term = (this.searchTerm || '').toLowerCase().trim();
    if (!term) {
      this.filteredLaterTrips = [...this.laterTrips];
      return;
    }

    this.filteredLaterTrips = this.laterTrips.filter(t => {
      const o = (t.schedule?.origin || '').toLowerCase();
      const d = (t.schedule?.destination || '').toLowerCase();
      const v = (t.schedule?.vehicle?.license_plate || '').toLowerCase();
      return o.includes(term) || d.includes(term) || v.includes(term);
    });
  }

  getStatusColor(status: string) {
    switch (status) {
      case 'scheduled': return 'primary';
      case 'on-going': return 'success';
      case 'completed': return 'medium';
      default: return 'light';
    }
  }

  startTrip(trip: any) {
    if (this.isStarting) return;
    this.isStarting = true;
    this.api.post(`trips/${trip.id}/start`, {}).subscribe({
      next: () => {
        this.isStarting = false;
        this.router.navigate(['/driver-tracking', { id: trip.id }]);
      },
      error: async (err) => {
        this.isStarting = false;
        if (err.status === 422 && err.error?.message?.includes('tidak ada penumpang')) {
          this.loadTrips(); // Refresh trips to mark it as empty
          const alert = await this.alertCtrl.create({
            header: 'Jadwal Kosong',
            message: 'Jadwal ini ditolak dan otomatis dibatalkan karena tidak ada penumpang yang melakukan booking.',
            buttons: ['OK']
          });
          await alert.present();
        } else {
          const toast = await this.toastCtrl.create({
            message: 'Gagal memulai perjalanan',
            duration: 2000,
            color: 'danger'
          });
          toast.present();
        }
      }
    });
  }

  completeTrip(trip: any) {
    this.api.post(`trips/${trip.id}/complete`, {}).subscribe(() => {
      this.loadTrips();
    });
  }

  updateLocation() {
    if (!this.activeTrip) return;

    // Simulate location update for demo
    const lat = -6.2088 + (Math.random() - 0.5) * 0.01;
    const lng = 106.8456 + (Math.random() - 0.5) * 0.01;

    this.api.post(`trips/${this.activeTrip.id}/location`, {
      latitude: lat,
      longitude: lng
    }).subscribe(() => {
      console.log('Location updated');
    });
  }
}
