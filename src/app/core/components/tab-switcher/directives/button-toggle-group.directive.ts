import {
  ChangeDetectorRef,
  ContentChildren,
  Directive,
  EventEmitter,
  forwardRef,
  HostBinding,
  HostListener,
  InjectionToken,
  Input,
  Output,
  QueryList
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { coerceBooleanProperty } from '@angular/cdk/coercion';

import { ButtonToggleComponent } from '../button-toggle.component';

export const CS_BUTTON_TOGGLE_GROUP = new InjectionToken<ButtonToggleGroupDirective>(
  'ButtonToggleGroupDirective'
);

@Directive({
  selector: '[hsButtonToggleSwitcher]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ButtonToggleGroupDirective),
      multi: true
    },
    {
      provide: CS_BUTTON_TOGGLE_GROUP,
      useExisting: ButtonToggleGroupDirective
    }
  ]
})
export class ButtonToggleGroupDirective implements ControlValueAccessor {

  @ContentChildren(forwardRef(() => ButtonToggleComponent)) toggleButtons: QueryList<ButtonToggleComponent>;

  @Input() multiple = false;
  @Input() inverted = false;
  @Input() withIcons = false;

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
  }

  @Input()
  set value(value: any) {    
    if (!Array.isArray(value) && this.multiple) {
      console.error('Value must be an array in multiple-selection mode.');
    } else {
      this.updateValue(value);
      // this.cdr.detectChanges();
    }
  }

  get value(): any {
    return this._value;
  }

  @Output() change: EventEmitter<any> = new EventEmitter<any>();

  @HostBinding('class.hs-tab-switcher-group-container')
  get toggleButtonGroupContainer(): boolean {
    return true;
  }

  @HostBinding('class.hs-tab-switcher-group-disabled')
  get toggleGroupDisabledClass(): boolean {
    return this.disabled;
  }

  @HostBinding('class.hs-tab-switcher-group-inverted')
  get toggleGroupInvertedClass(): boolean {
    return this.inverted;
  }

  @HostBinding('class.hs-tab-switcher-group-icons')
  get toggleGroupWithIconsClass(): boolean {
    return this.withIcons;
  }

  private _disabled = false;
  private _value: any;

  constructor(private cdr: ChangeDetectorRef) {}

  get toggleButtonsArray(): ButtonToggleComponent[] {
    return this.toggleButtons?.toArray() || [];
  }

  onChangeFn: any = () => {};
  onTouchFn: any = () => {};

  registerOnChange(fn: any): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouchFn = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.detectChanges();
  }

  writeValue(value: any): void {
    this.value = value;
  }

  onChange(value: any): void {
    this.onChangeFn(value);
  }

  updateValue(value: any): void {
    this._value = value;
    this.onChange(this._value);
  }

  updateValueFromItem(value: any): void {
    if (this.disabled) return;
    if (this.multiple) {
      if (!this.value) {
        this.value = [];
      }
      if (this.value.indexOf(value) === -1) {
        this.value = [...this.value, value];
        this.emitChange();
      } else {
        this.value = this.value.filter(
          (val: any) => val !== value
        );
        this.emitChange();
      }
    } else {
      this.value = value;
      this.emitChange();
    }
  }

  private emitChange(): void {
    this.change.emit(this._value);
  }
}
