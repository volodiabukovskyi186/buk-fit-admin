import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostBinding,
  Input,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'hs-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IQCheckboxComponent),
      multi: true
    }
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IQCheckboxComponent implements ControlValueAccessor, OnInit {
  @Input() set size(size: number) {
    this._size = size;
    this.el.nativeElement.style.setProperty(
      '--iq-checkbox-checkmark-size',
      `${this._size}px`
    );
  }

  @Input() disabled = false;
  @Input() indeterminate = false;

  @Input() set checked(checked: boolean) {
    this.checkedValue = checked || false;
    this.indeterminate = false;
  }

  get checked(): boolean {
    return this.checkedValue;
  }

  @Output() valueChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  @ViewChild('checkbox') checkbox!: ElementRef<HTMLInputElement>;

  @HostBinding('class')
  get checkboxClass(): string {
    return `iq-checkbox`;
  }

  private checkedValue!: boolean;
  private _size = 18;

  onChange: any = () => {};
  onTouch: any = () => {};

  constructor(private cdr: ChangeDetectorRef, private el: ElementRef) {
  }

  ngOnInit(): void {
    this.el.nativeElement.style.setProperty(
      '--iq-checkbox-checkmark-size',
      `${this._size}px`
    );
  }

  focus(): void {
    setTimeout(() => {
      if (this.checkbox) {
        this.checkbox.nativeElement.focus();
      }
    }, 0);
  }

  writeValue(value: boolean): void {
    this.checkedValue = value || false;
    this.cdr.detectChanges();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.detectChanges();
  }

  changeValue(value: any): void {
    this.checked = value.target.checked;
    this.onChange(this.checkedValue);
    this.valueChange.emit(this.checkedValue);
  }
}
