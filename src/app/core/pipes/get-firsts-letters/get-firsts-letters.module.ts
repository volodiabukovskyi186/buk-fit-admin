import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HSGetFirstsLettersPipe } from './get-firsts-letters.pipe';



@NgModule({
  declarations: [
    HSGetFirstsLettersPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [HSGetFirstsLettersPipe]
})
export class HSGetFirstsLettersModule { }
