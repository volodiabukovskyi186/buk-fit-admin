import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  Input,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import moment from 'moment';

@Component({
  selector: 'hs-time-picker',
  templateUrl: './time-picker.component.html',
  styleUrls: ['./time-picker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TimePickerComponent),
      multi: true
    }
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimePickerComponent implements ControlValueAccessor, OnInit {
  @Input() mask = 'Hh:m0';
  @Input() placeholder = 'HH:MM';

  disabled: boolean;
  value = '';

  constructor(
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {}

  onChange: any = () => {
    this.cdr.detectChanges();
  };

  onTouch: any = () => {
    this.cdr.detectChanges();
  };

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  writeValue(inputValue: any): void {
    this.value = inputValue || '';
    this.cdr.detectChanges();
  }

  valueChange(value: string): void {
    this.onChange(value);
  }

  setCurrentTime(): void {
    const currentHour = moment().format('HH');
    const currentMinute = moment().format('mm');

    this.value = `${currentHour}:${currentMinute}`;
    this.valueChange(this.value);
  }

  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
    this.cdr.detectChanges();
  }

  onInputFocusOut(): void {
    if (!this.value) {
      return;
    }

    const splitTime = this.value.split(':');

    if (splitTime.length === 2) {
      splitTime[1] = this.formatTimeValue(splitTime[1] || '');
    } else if (splitTime.length === 1) {
      splitTime[0] = this.formatTimeValue(splitTime[0] || '');
      splitTime[1] = this.formatTimeValue(splitTime[1] || '');
    }

    this.value = splitTime.join(':');
    this.onChange(this.value);
  }

  private formatTimeValue(value: string): string {
    if (value.length === 1) {
      return `0${value}`;
    }
    if (value.length === 0) {
      return '00';
    }

    return value;
  }
}
