import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login/login.component';
import { MatDialogModule } from '@angular/material/dialog';
import { HSTimeToUtcModule } from '../core/pipes/utc-to-local/utc-to-local.module';
import { HSFormFieldModule } from '../core/components/form-field';
import { HSInputModule } from '../core/components/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HSButtonModule } from '../core/components/button';


@NgModule({
  declarations: [LoginComponent],
  imports: [
    MatDialogModule,
    HSInputModule,
    HSFormFieldModule,
    HSTimeToUtcModule,
    ReactiveFormsModule,
    FormsModule,
    HSButtonModule,
    CommonModule,
    AuthRoutingModule
  ]
})
export class AuthModule { }
