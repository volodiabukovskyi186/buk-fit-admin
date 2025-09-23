import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';

import { PaginationComponent } from './pagination.component';
import { HSSelectModule } from '../select/select.module';
import { HSFormFieldModule } from '../form-field';
import { HSInputModule } from '../input';

@NgModule({
  declarations: [
    PaginationComponent
  ],
  imports: [
    ReactiveFormsModule,
    HSFormFieldModule,
    TranslateModule,
    HSSelectModule,
    HSInputModule,
    CommonModule
  ],
  exports:[PaginationComponent]
})
export class HSPaginationModule { }
