import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { HSInputDirective } from './input.directive';

@NgModule({
  imports: [CommonModule, FormsModule],
  exports: [HSInputDirective],
  declarations: [HSInputDirective]
})
export class HSInputModule {
}
