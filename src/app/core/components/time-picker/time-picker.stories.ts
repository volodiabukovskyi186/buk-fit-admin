import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, Input, NgModule, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { moduleMetadata } from '@storybook/angular';

import { TimePickerModule } from './time-picker.module';
import { TimePickerComponent } from './time-picker.component';
import { InputModule } from '../input';
import { boolean } from '@storybook/addon-knobs';

@Component({
  selector: 'hs-time-picker-stories',
  template: `
    <div [formGroup]="myGroup" style="width:140px">
      <hs-field>
        <span csLabel class="hs-label">Time-picker label</span>
        <hs-time-picker #timePicker formControlName="time"></hs-time-picker>
        <div *ngIf="myGroup.get('time').invalid">
          <span class="hs-error">
            Time invalid
          </span>
        </div>
      </hs-field>
    </div>
  `
})
class HSTimePickerStorybookComponent implements OnInit {
  @Input() set disabled(disabled: boolean) {
    if (disabled) {
      this.myGroup.get('time')?.disable();
    } else {
      this.myGroup.get('time')?.enable();
    }
  }

  myGroup: FormGroup = new FormGroup({
    time: new FormControl('22:22', [Validators.required])
  });

  constructor() {}

  ngOnInit(): void {
  }
}

@NgModule({
  imports: [
    TimePickerModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    InputModule
  ],
  declarations: [HSTimePickerStorybookComponent],
  exports: [HSTimePickerStorybookComponent]
})
class HSTimePickerStorybookModule {}

export default {
  title: 'TimePickerComponent',
  component: TimePickerComponent,
  decorators: [
    moduleMetadata({
      imports: [HSTimePickerStorybookModule]
    })
  ]
};

export const primary = () => ({
  moduleMetadata: {
    imports: [HSTimePickerStorybookModule]
  },
  props: {
    disabled: boolean('disabled', false)
  },
  template: `<hs-time-picker-stories [disabled]="disabled"></hs-time-picker-stories>`
});
