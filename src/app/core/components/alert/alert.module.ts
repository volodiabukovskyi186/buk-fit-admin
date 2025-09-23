import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';


import { HSAlertComponent } from './alert.component';
import { HSButtonModule } from '../button';

@NgModule({
  declarations: [
    HSAlertComponent
  ],
  imports: [
    CommonModule,
    MatSnackBarModule,
    HSButtonModule
  ],
  exports: [HSAlertComponent]
})
export class HSAlertModule { }
