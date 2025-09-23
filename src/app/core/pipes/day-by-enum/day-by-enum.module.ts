import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DayByEnumPipe } from './day-by-enum.pipe';



@NgModule({
  declarations: [
    DayByEnumPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [DayByEnumPipe]
})
export class HSDayByEnumModule { }
