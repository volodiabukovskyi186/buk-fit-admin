import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ButtonToggleComponent } from './button-toggle.component';
import { ButtonToggleGroupDirective } from './directives/button-toggle-group.directive';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  exports: [ButtonToggleComponent, ButtonToggleGroupDirective],
  declarations: [ButtonToggleComponent, ButtonToggleGroupDirective],
})
export class HSTabSwitcherModule {}