import { Component, EventEmitter, forwardRef, ViewEncapsulation, OnInit } from '@angular/core';
import { HostBinding, Input, Output, HostListener } from '@angular/core';

import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'iq-slide-toggle',
  templateUrl: './slide-toggle.component.html',
  styleUrls: ['./slide-toggle.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IQSlideToggleComponent),
      multi: true,
    },
  ],
})
export class IQSlideToggleComponent implements OnInit, ControlValueAccessor {
  inputControl: FormControl = new FormControl(false);
  id = '';
  icon = '';

  @Input() disabled = false;
  @Input() title = '';
  @Input() set iconClass(value: string) {
    this.icon = value;
  }

  @HostBinding('class')
  get buttonBaseClass(): string {
    return this.icon ? 'hs-silde-toggle-with-icon': '';
  }

  @Input() set value(value: boolean) {    
    this.inputControl.setValue(value);
  }

  @Output() slideToggleChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  @HostBinding('class.iq-slide-toggle-disabled')
  get disabledClass(): boolean {
    return this.disabled;
  }

  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    if (this.disabled) {
      event.preventDefault();
    }
  }

  ngOnInit(): void {
    this.id = this.uuidv4();
  }

  onChange: any = () => {
  };

  onTouched = () => {
  };

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  writeValue(value: boolean): void {
    this.value = value;
  }

  toggleSlider(): void {
    this.onChange(!this.inputControl.value);
    this.slideToggleChange.emit(!this.inputControl.value);
  }

  private uuidv4(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0,
          v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }
}
