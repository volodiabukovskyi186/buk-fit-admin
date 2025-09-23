import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  Input,
  ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import moment from 'moment';

@Component({
  selector: 'hs-time-range-picker',
  templateUrl: './time-range-picker.component.html',
  styleUrls: ['./time-range-picker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TimeRangePickerComponent),
      multi: true
    }
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimeRangePickerComponent implements ControlValueAccessor {
  @Input() mask = 'Hh:m0-Hh:m0';
  @Input() placeholder = 'HH:MM-HH:MM';

  disabled: boolean;
  value = '';

  constructor(
    private cdr: ChangeDetectorRef
  ) { }

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

  setCurrentTimeInterval(): void {
    const currentHour = moment().format('HH');
    const currentMinute = moment().format('mm');

    const currentTime = currentHour + ':' + currentMinute;
    const afterHourTime = +currentHour.slice(0,2) + 1 + ':' + currentMinute;

    this.value = `${currentTime}:${afterHourTime}`;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.detectChanges();
  }

  onInputFocusOut(): void {
    if (!this.value) {
      return;
    }

    let [splitTimeFrom, splitTimeTo]  = this.value.split('-');

    if (splitTimeFrom && !splitTimeTo) {
      splitTimeFrom = this.checkTimeLength(splitTimeFrom)
      splitTimeTo = +splitTimeFrom.slice(0,2) + 1 + '';
    }

    if (splitTimeFrom && splitTimeTo) {

      splitTimeFrom = this.checkTimeLength(splitTimeFrom);
      splitTimeTo = this.checkTimeLength(splitTimeTo);

      if (splitTimeFrom >= splitTimeTo) {
        if (splitTimeFrom.slice(0,2) === '00') {
          splitTimeTo = '01:00'
        } else {
          splitTimeTo = +splitTimeFrom.slice(0,2) + 1 + ':00';
        }
      }
    }

    this.value = splitTimeFrom + '-' + splitTimeTo;
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

  private checkTimeLength(timeValue: string): string {
    const splitTime = timeValue.split(':');

    if (splitTime.length === 2) {
      splitTime[1] = this.formatTimeValue(splitTime[1] || '');
    } else if (splitTime.length === 1) {
      splitTime[0] = this.formatTimeValue(splitTime[0] || '');
      splitTime[1] = this.formatTimeValue(splitTime[1] || '');
    }

    return splitTime.join(':');
  }
}
