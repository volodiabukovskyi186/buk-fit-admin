import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HtmlSavePipe } from './save-thml.pipe';



@NgModule({
  declarations: [HtmlSavePipe],
  imports: [
    CommonModule
  ],
  exports: [HtmlSavePipe]
})
export class HSSaveHtmlModule { }
