import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HSStepperOptionComponent } from './components/stepper-option/stepper-option.component';
import { HSStepperComponent } from './stepper.component';


@NgModule({
  declarations: [
    HSStepperComponent,
    HSStepperOptionComponent
  ],
  imports: [
    CommonModule
  ],
  exports:[HSStepperComponent, HSStepperOptionComponent]
})
export class HSStepperModule { }
