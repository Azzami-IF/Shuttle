import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, AlertController } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface Vehicle {
  id: number;
  registration_number: string;
  vehicle_type: string;
  make: string;
  model: string;
  year: number;
  capacity: number;
  driver_id: number | null;
  status: string;
  last_service_date: string;
  created_at: string;
}

interface PaginationData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

@Component({
  selector: 'app-admin-vehicles',
  templateUrl: './admin-vehicles.page.html',
  styleUrls: ['./admin-vehicles.page.scss'],
  standalone: false
})
export class AdminVehiclesPage implements OnInit, OnDestroy {
  private adminService = inject(AdminService);
  private modalCtrl = inject(ModalController);
  private alertCtrl = inject(AlertController);
  private fb = inject(FormBuilder);

  vehicles: Vehicle[] = [];
  pagination: PaginationData = {
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0
  };

  loading = false;
  error: string | null = null;
  searchQuery = '';

  vehicleForm!: FormGroup;
  editingVehicle: Vehicle | null = null;

  private destroy$ = new Subject<void>();

  constructor() {
    this.initializeForm();
  }

  ngOnInit() {
    this.loadVehicles();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializeForm() {
    this.vehicleForm = this.fb.group({
      registration_number: ['', Validators.required],
      vehicle_type: ['car', Validators.required],
      make: ['', Validators.required],
      model: ['', Validators.required],
      year: [new Date().getFullYear(), Validators.required],
      capacity: [4, [Validators.required, Validators.min(1)]]
    });
  }

  loadVehicles(page: number = 1) {
    this.loading = true;
    this.error = null;

    this.adminService.getVehicles(
      this.searchQuery || undefined,
      this.pagination.per_page,
      page
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.vehicles = response.data || [];
          this.pagination = response.pagination || {
            current_page: page,
            last_page: 1,
            per_page: 20,
            total: this.vehicles.length
          };
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load vehicles';
          console.error(err);
          this.loading = false;
        }
      });
  }

  onSearchChange() {
    this.pagination.current_page = 1;
    this.loadVehicles(1);
  }

  nextPage() {
    if (this.pagination.current_page < this.pagination.last_page) {
      this.loadVehicles(this.pagination.current_page + 1);
    }
  }

  prevPage() {
    if (this.pagination.current_page > 1) {
      this.loadVehicles(this.pagination.current_page - 1);
    }
  }

  async openCreateModal() {
    this.editingVehicle = null;
    this.vehicleForm.reset({ vehicle_type: 'car', year: new Date().getFullYear(), capacity: 4 });
    await this.showFormModal();
  }

  async openEditModal(vehicle: Vehicle) {
    this.editingVehicle = vehicle;
    this.vehicleForm.patchValue({
      registration_number: vehicle.registration_number,
      vehicle_type: vehicle.vehicle_type,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      capacity: vehicle.capacity
    });
    await this.showFormModal();
  }

  private async showFormModal() {
    const modal = await this.modalCtrl.create({
      component: VehicleFormModalComponent,
      componentProps: {
        form: this.vehicleForm,
        vehicle: this.editingVehicle
      },
      cssClass: 'vehicle-form-modal'
    });

    await modal.present();
    const result = await modal.onDidDismiss();

    if (result.role === 'confirm' && this.vehicleForm.valid) {
      this.saveVehicle();
    }
  }

  saveVehicle() {
    if (!this.vehicleForm.valid) return;

    const formData = this.vehicleForm.value;
    const request = this.editingVehicle
      ? this.adminService.updateVehicle(this.editingVehicle.id, formData)
      : this.adminService.createVehicle(formData);

    request
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadVehicles(this.pagination.current_page);
        },
        error: (err) => {
          this.error = `Failed to ${this.editingVehicle ? 'update' : 'create'} vehicle`;
          console.error(err);
        }
      });
  }

  async deleteVehicle(vehicle: Vehicle) {
    const alert = await this.alertCtrl.create({
      header: 'Delete Vehicle',
      message: `Are you sure you want to delete ${vehicle.registration_number}?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.adminService.deleteVehicle(vehicle.id)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: () => {
                  this.loadVehicles(this.pagination.current_page);
                },
                error: (err) => {
                  this.error = 'Failed to delete vehicle';
                  console.error(err);
                }
              });
          }
        }
      ]
    });

    await alert.present();
  }

  getStatusBadgeColor(status: string): string {
    const colors: { [key: string]: string } = {
      'active': 'success',
      'maintenance': 'warning',
      'inactive': 'medium'
    };
    return colors[status] || 'medium';
  }

  getTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'car': 'car',
      'van': 'bus',
      'truck': 'car-sport'
    };
    return icons[type] || 'car';
  }
}

@Component({
  selector: 'app-vehicle-form-modal',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ vehicle ? 'Edit Vehicle' : 'Create Vehicle' }}</ion-title>
        <ion-buttons slot="start">
          <ion-button (click)="dismiss()">Cancel</ion-button>
        </ion-buttons>
        <ion-buttons slot="end">
          <ion-button (click)="confirm()" [disabled]="!form.valid">Save</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <form [formGroup]="form">
        <ion-item>
          <ion-label position="floating">Registration Number</ion-label>
          <ion-input formControlName="registration_number" placeholder="e.g., ABC1234"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="floating">Vehicle Type</ion-label>
          <ion-select formControlName="vehicle_type">
            <ion-select-option value="car">Car</ion-select-option>
            <ion-select-option value="van">Van</ion-select-option>
            <ion-select-option value="truck">Truck</ion-select-option>
          </ion-select>
        </ion-item>
        <ion-item>
          <ion-label position="floating">Make</ion-label>
          <ion-input formControlName="make" placeholder="e.g., Toyota"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="floating">Model</ion-label>
          <ion-input formControlName="model" placeholder="e.g., Corolla"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="floating">Year</ion-label>
          <ion-input formControlName="year" type="number" placeholder="2024"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="floating">Capacity</ion-label>
          <ion-input formControlName="capacity" type="number" min="1" placeholder="4"></ion-input>
        </ion-item>
      </form>
    </ion-content>
  `,
  standalone: false
})
export class VehicleFormModalComponent {
  private modalCtrl = inject(ModalController);

  form!: FormGroup;
  vehicle: Vehicle | null = null;

  constructor() { }

  dismiss() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    if (this.form.valid) {
      this.modalCtrl.dismiss(null, 'confirm');
    }
  }
}
