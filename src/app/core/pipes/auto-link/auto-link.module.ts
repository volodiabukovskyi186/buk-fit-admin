import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutoLinkPipe } from './auto-link.pipe';



@NgModule({
  declarations: [
    AutoLinkPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [AutoLinkPipe]
})
export class MGAutolinkModule { }
