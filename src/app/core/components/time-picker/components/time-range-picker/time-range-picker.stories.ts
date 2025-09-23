import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, Input, NgModule, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { moduleMetadata } from '@storybook/angular';
import { boolean } from '@storybook/addon-knobs';

import { TimePickerModule } from '../../time-picker.module';
import { InputModule } from '../../../input';
import { TimeRangePickerComponent } from './time-range-picker.component';


@Component({
  selector: 'hs-time-range-picker-stories',
  template: `
    <div [formGroup]="myGroup" style="width:140px">
      <hs-field>
        <span csLabel class="hs-label">Time-picker label</span>
        <hs-time-range-picker #timePicker formControlName="time"></hs-time-range-picker>
        <div *ngIf="myGroup.get('time').invalid && myGroup.get('time').touched">
          <span class="hs-error">
            Time invalid
          </span>
        </div>
      </hs-field>
    </div>
  `
})
class HSTimeRangePickerStorybookComponent implements OnInit {
  @Input() set disabled(disabled: boolean) {
    if (disabled) {
      this.myGroup.get('time')?.disable();
    } else {
      this.myGroup.get('time')?.enable();
    }
  }

  myGroup: FormGroup = new FormGroup({
    time: new FormControl('', [Validators.required])
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
  declarations: [HSTimeRangePickerStorybookComponent],
  exports: [HSTimeRangePickerStorybookComponent]
})
class HSTimeRangePickerStorybookModule {}

export default {
  title: 'TimeRangePickerComponent',
  component: TimeRangePickerComponent,
  decorators: [
    moduleMetadata({
      imports: [HSTimeRangePickerStorybookModule]
    })
  ]
};

export const primary = () => ({
  moduleMetadata: {
    imports: [HSTimeRangePickerStorybookModule]
  },
  props: {
    disabled: boolean('disabled', false)
  },
  template: `<hs-time-range-picker-stories [disabled]="disabled"></hs-time-range-picker-stories>`
});
