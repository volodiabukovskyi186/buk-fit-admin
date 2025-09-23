import { AfterContentInit, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { Component, ContentChildren, EventEmitter, forwardRef, Input, OnDestroy } from '@angular/core';
import { Optional, Output, QueryList, Self, ViewEncapsulation  } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

import { Subscription } from 'rxjs';

import { HSRadioButtonComponent } from '../radio-button/radio-button.component';
import { RadioChange } from '../radio-change.class';

export enum RadioGroupAlignmentEnum {
  row = 'row',
  column = 'column'
}

@Component({
  selector: 'hs-radio-group',
  templateUrl: './radio-group.component.html',
  styleUrls: ['radio-group.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  
})
export class HSRadioGroupComponent implements OnChanges, AfterContentInit, AfterViewInit, ControlValueAccessor, OnDestroy {

  private static radioGroupCount = 0;

  @ContentChildren(forwardRef(() => HSRadioButtonComponent), {
    descendants: false
  })
  radios!: QueryList<HSRadioButtonComponent>;

  @Input()
  set selected(selected: HSRadioButtonComponent | null) {
    this._selected = selected;
    this.value = selected ? selected.value : null;
    this.checkSelectedRadio();
  }

  get selected(): HSRadioButtonComponent | null {
    return this._selected;
  }

  @Input()
  set value(newValue: any) {
    if (this._value !== newValue) {
      this._value = newValue;
    }

    setTimeout(() => {
      this.updateSelectedRadioFromValue();
      this.checkSelectedRadio();
    });
  }

  get value(): any {
    return this._value;
  }

  @Input()
  set name(name: string) {
    this._name = name;
    this.updateRadios();
  }

  get name(): string {
    return this._name;
  }

  @Input() isDisabled = false;

  @Input()
  set disabled(disabled: boolean) {
    this._disabled = disabled;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.radios.forEach((radio) => {
        radio.disabled = disabled;
        radio.markForCheck();
      });
    });
  }

  get disabled(): boolean {
    return this._disabled;
  }

  @Input() alignment: keyof typeof RadioGroupAlignmentEnum = RadioGroupAlignmentEnum.column;

  @Output() changeValue: EventEmitter<RadioChange<any>> = new EventEmitter<RadioChange<any>>();

  protected _value: any = null;
  protected _disabled = false;
  protected _selected: HSRadioButtonComponent | null = null;
  protected _name = `hs-radio-group-${HSRadioGroupComponent.radioGroupCount++}`;
  private subscription: Subscription = new Subscription();

  constructor(
    private cdr: ChangeDetectorRef,
    private _elementRef: ElementRef,
    @Self() @Optional() protected control: NgControl
  ) {
    // tslint:disable-next-line:no-unused-expression
    this.control && (this.control.valueAccessor = this);
  }

  get invalid(): boolean {
    return this.control ? this.control.invalid || false : false;
  }

  propagateChange = (_: any) => {};
  onTouched: () => any = () => {};

  ngOnChanges(changes: SimpleChanges): void {
    if(changes.isDisabled) {
     this.setIsDisabled(changes.isDisabled.currentValue);
    }
  }

  ngAfterContentInit(): void {
    const stream$ = this.radios.changes.subscribe(() => {
      this.updateRadios();
      this.updateRadioChangeHandler();
    });

    this.subscription.add(stream$);

    this.updateRadioChangeHandler();
  }

  ngAfterViewInit(): void {
    this.updateRadios();
  }

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();

    setTimeout(() => {
      this.radios.forEach((radio) => {
        radio.disabled = isDisabled;
        radio.markForCheck();
      });
    });
  }

  emitChangeEvent(event: RadioChange) {
    this.changeValue.emit(event);
    this.propagateChange(event.value);
    this.onTouched();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  protected updateRadioChangeHandler(): void {
    if (this.radios) {
      this.radios.forEach(radio => {
        radio.registerRadioChangeHandler((event: RadioChange) => {
          this.selected = event.source;
          this._value = event.value;

          this.emitChangeEvent(event);
        });
      });
    }
  }

  private setIsDisabled(isDisabled): void {
    setTimeout(()=> {
      if (isDisabled) {
        this._elementRef.nativeElement.classList.add(`hs-radio-group-disabled`);
       } else {
         this._elementRef.nativeElement.classList.remove(`hs-radio-group-disabled`);
       }
    });
  }

  private checkSelectedRadio(): void {
    if (this._selected && !this._selected?.checked) {
      this._selected.checked = true;
      this._selected.markForCheck();
    }
  }

  private updateSelectedRadioFromValue(): void {
    const alreadySelected = this._selected != null && this._selected.value === this._value;

    if (this.radios) {
      if (!alreadySelected) {
        this._selected = null;
        this.radios.forEach(radio => {
          radio.checked = this.value === radio.value;
          if (radio.checked) {
            this._selected = radio;
          }
          radio.markForCheck();
        });
      }
      this.radios.forEach((radio) => radio.checked = false);
    }
  }

  private updateRadios(): void {
    if (this.radios) {
      setTimeout(() => {
        this.radios.forEach((radio) => {
          radio.name = this.name;
          radio.markForCheck();
        });
      });
    }
  }
}
