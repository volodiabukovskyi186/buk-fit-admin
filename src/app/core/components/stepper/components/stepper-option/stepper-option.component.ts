import { Component, HostBinding, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'hs-stepper-option',
  templateUrl: './stepper-option.component.html',
  styleUrls: ['./stepper-option.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HSStepperOptionComponent {
  @Input() value: any;
  isActive = false;
  viewCount

  @HostBinding('class.hs-stepper-option-counter-active')
  get activeStepClass(): boolean {
    return this.isActive;
  }
  active(): void {
    this.isActive = true;
  }

  deactive(): void {
    this.isActive = false;
  }

}
