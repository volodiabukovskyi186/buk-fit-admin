import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { PortalModule } from '@angular/cdk/portal';
import { OverlayModule } from '@angular/cdk/overlay';

import { HSSelectComponent } from './select.component';
import { HSDropdownComponent } from './components/dropdown/dropdown.component';
import { HSSelectOptionComponent } from './components/select-option/select-option.component';
import { HSSelectTriggerComponent } from './components/select-trigger/select-trigger.component';
import { HSSelectOptionAllComponent } from './components/select-option-all/select-option-all.component';
import {HSScrollEndDirective} from './directives/scroll-end.directive';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, PortalModule, OverlayModule],
  exports: [HSSelectComponent, HSDropdownComponent, HSSelectOptionComponent, HSSelectOptionAllComponent, HSSelectTriggerComponent],
  declarations: [HSSelectComponent, HSDropdownComponent, HSSelectOptionComponent, HSSelectOptionAllComponent, HSSelectTriggerComponent, HSScrollEndDirective]
})
export class HSSelectModule {
}
