import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HSAvatarComponent } from './avatar.component';
import { GetFirstsLettersPipe } from './pipes/get-firsts-letters.pipe';


@NgModule({
  imports: [

    CommonModule
  ],
  exports: [HSAvatarComponent],
  declarations: [HSAvatarComponent, GetFirstsLettersPipe]
})
export class HSAvatarModule {
}
