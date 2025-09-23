import { FormsModule } from '@angular/forms';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CKEditorModule } from '@ckeditor/ckeditor5-angular';

import { TextEditorComponent } from './text-editor.component';

@NgModule({
  declarations: [TextEditorComponent],
  exports: [TextEditorComponent],
  imports: [
    CommonModule,
    CKEditorModule,
    FormsModule
  ]
})

export class HSTextEditorModule { }
