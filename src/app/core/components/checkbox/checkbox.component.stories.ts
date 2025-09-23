import { Component, Input, NgModule, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { number, boolean } from '@storybook/addon-knobs';

import { CheckboxComponent } from './checkbox.component';
import { CheckboxModule } from './checkbox.module';
import { ButtonModule } from '../button';

@Component({
  selector: 'cs-checkbox-test',
  template: `
    <div [formGroup]="myGroup">
      <cs-checkbox-ui
        formControlName="myCheckbox"
        [disabled]="disabled"
        [checked]="checked"
        [size]="size"
        [indeterminate]="indeterminate"
      >
      </cs-checkbox-ui>
    </div>
  `,
})

class CsCheckboxTest implements OnInit {
  @Input() size: number;
  @Input() checked: boolean;
  @Input() disabled: boolean;
  @Input() indeterminate: boolean;

  myGroup: FormGroup;
  myCheckbox: FormControl;

  constructor(public fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.myGroup = this.fb.group({
      myCheckbox: this.fb.control(false)
    })
  }
}

@NgModule( {
  imports: [
    CheckboxModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    CommonModule
  ],
  declarations: [CsCheckboxTest],
  exports:[CsCheckboxTest]
})
class CsCheckboxTestModule {
}

export default {
  title: 'CheckboxComponent',
}

export const primary = () => ({
  moduleMetadata: {
    imports: [CsCheckboxTestModule]
  },
  props: {
    size: number('size', 16),
    disabled: boolean('disabled', false),
    checked: boolean('checked', false),
    indeterminate: boolean('indeterminate', false),
  },
  template: '<cs-checkbox-test [size]="size" [disabled]="disabled" [checked]="checked" [indeterminate]="indeterminate"></cs-checkbox-test>'
})
