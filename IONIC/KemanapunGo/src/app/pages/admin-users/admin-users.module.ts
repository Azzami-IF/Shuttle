import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { AdminUsersPage, UserFormModal } from './admin-users.page';

const routes: Routes = [
  {
    path: '',
    component: AdminUsersPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [AdminUsersPage, UserFormModal]
})
export class AdminUsersPageModule {}
