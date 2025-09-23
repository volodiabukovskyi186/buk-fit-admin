import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { IQSlideToggleComponent } from './slide-toggle.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule],
  exports: [IQSlideToggleComponent],
  declarations: [IQSlideToggleComponent],
})
export class HSSlideToggleModule {
}

