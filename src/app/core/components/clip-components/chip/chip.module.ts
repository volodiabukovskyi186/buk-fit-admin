import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HSAutoWidthModule } from '../../../directives/auto-width/auto-width.module';
import { ChipComponent } from './chip.component';

@NgModule({
  imports: [CommonModule, HSAutoWidthModule],
  exports: [ChipComponent],
  declarations: [ChipComponent],
})
export class ChipModule {}
