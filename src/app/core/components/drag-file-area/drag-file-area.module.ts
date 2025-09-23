import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HSDragFileirective } from './directives/drag-file.directive';
import { DragFileAreaComponent } from './drag-file-area.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [DragFileAreaComponent, HSDragFileirective],
  imports: [
    TranslateModule,
    CommonModule,
    
  ],
  exports: [DragFileAreaComponent]
})
export class HSDragFileAreaModule { }
