import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

import { TimePickerComponent } from './time-picker.component';
import { TimeRangePickerComponent } from './components/time-range-picker/time-range-picker.component';

@NgModule({
  imports: [
    CommonModule,
    NgxMaskDirective,
    FormsModule
  ],
  exports: [TimePickerComponent, TimeRangePickerComponent],
  declarations: [TimePickerComponent, TimeRangePickerComponent],
  providers:[
    provideNgxMask(),
  ]
})
export class HSTimePickerModule {}
