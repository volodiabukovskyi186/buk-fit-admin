import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { PortalModule } from '@angular/cdk/portal';
import { OverlayModule } from '@angular/cdk/overlay';

import { HSSelectComponent } from './text-select.component';
import { HSDropdownComponent } from './components/text-dropdown/text-dropdown.component';
import { HSSelectOptionComponent } from './components/text-select-option/text-select-option.component';
import { HSSelectTriggerComponent } from './components/text-select-trigger/select-trigger.component';
import { HSSelectOptionAllComponent } from './components/text-select-option-all/text-select-option-all.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, PortalModule, OverlayModule],
  exports: [HSSelectComponent, HSDropdownComponent, HSSelectOptionComponent, HSSelectOptionAllComponent, HSSelectTriggerComponent],
  declarations: [HSSelectComponent, HSDropdownComponent, HSSelectOptionComponent, HSSelectOptionAllComponent, HSSelectTriggerComponent]
})
export class HSTextSelectModule {
}
