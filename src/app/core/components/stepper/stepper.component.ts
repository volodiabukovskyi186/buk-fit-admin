import { AfterViewInit, Component, ContentChildren, ElementRef, Input, QueryList, ViewChildren, ViewContainerRef, ViewEncapsulation, forwardRef } from '@angular/core';
import { HSStepperOptionComponent } from './components/stepper-option/stepper-option.component';

@Component({
  selector: 'hs-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HSStepperComponent implements AfterViewInit {
  @ContentChildren(forwardRef(() => HSStepperOptionComponent)) stepComponents: QueryList<HSStepperOptionComponent>;

  @Input() set value(value: any) {

    if(!this.currentValue) {
      this.currentValue = value;
      return;
    }

    this.currentValue = value;
    this.selectStep();
  }

  currentValue;

  constructor( private _elementRef: ElementRef,){}

  ngAfterViewInit(): void {
    this.selectStep();
  }



  private selectStep(): void {
    setTimeout(() => {
     
      this.stepperArray.forEach((step: HSStepperOptionComponent, index: number) => {
        step.viewCount = index + 1;
        if (step.value === this.currentValue) {
          step.active()
        } else {
          step.deactive()
        }
      });
    })
  }

  get stepperArray(): HSStepperOptionComponent[] {
    return this.stepComponents?.toArray() || [];
  }
}
