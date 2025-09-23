import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TitleByEnumPipe } from './title-by-enum.pipe';

@NgModule({
  declarations: [TitleByEnumPipe],
  imports: [
    CommonModule
  ],
  exports: [TitleByEnumPipe]
})
export class TitleByEnumModule { }
