import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HSFormFieldComponent } from './form-field.component';

import { HSLabelComponent } from './components/label/label.component';

import { HSErrorDirective } from './directives/error';
import { HSSuffixDirective } from './directives/suffix';
import { HSPrefixDirective } from './directives/prefix';
import { HSHintDirective } from './directives/hint';

@NgModule({
  imports: [
    CommonModule,
  ],
  exports: [HSFormFieldComponent, HSLabelComponent, HSErrorDirective, HSSuffixDirective, HSPrefixDirective, HSHintDirective],
  declarations: [HSFormFieldComponent, HSLabelComponent, HSErrorDirective, HSSuffixDirective, HSPrefixDirective, HSHintDirective],
  providers: [],
})
export class HSFormFieldModule {
}
