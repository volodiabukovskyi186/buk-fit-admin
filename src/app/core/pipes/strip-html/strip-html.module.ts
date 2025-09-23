import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StripHTMLPipe } from './strip-html.pipe';



@NgModule({
  declarations: [StripHTMLPipe],
  imports: [
    CommonModule
  ],
  exports: [StripHTMLPipe]
})
export class HSStripHTMLModule { }
