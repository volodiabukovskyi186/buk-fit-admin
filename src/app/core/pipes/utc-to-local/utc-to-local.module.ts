import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HSUtcToLocalPipe } from './utc-to-local.pipe';

@NgModule({
  declarations: [HSUtcToLocalPipe],
  imports: [
    CommonModule
  ],
  exports: [ HSUtcToLocalPipe]
})
export class HSTimeToUtcModule { }
