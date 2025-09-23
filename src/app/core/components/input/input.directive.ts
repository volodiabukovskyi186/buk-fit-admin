import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { getSupportedInputTypes } from '@angular/cdk/platform';
import {
  Directive,
  DoCheck,
  ElementRef,
  Inject,
  Input,
  OnDestroy,
  Optional,
  Self,
} from '@angular/core';
import { FormGroupDirective, NgControl, NgForm, Validators } from '@angular/forms';
import { CanUpdateErrorState, ErrorStateMatcher, mixinErrorState } from '@angular/material/core';

import { Subject } from 'rxjs';
import { HSFormFieldComponent, HS_FORM_FIELD } from '../form-field';

import { HSFormFieldControl } from '../form-field/form-field-control';
import { getHSInputUnsupportedTypeError } from './input-errors';
import { HS_INPUT_VALUE_ACCESSOR } from './input-value-accessor';

// Invalid input type. Using one of these will throw an MatInputUnsupportedTypeError.
const HS_INPUT_INVALID_TYPES = [
  'button',
  'checkbox',
  'file',
  'hidden',
  'image',
  'radio',
  'range',
  'reset',
  'submit',
];

let nextUniqueId = 0;


const HSInputBase = mixinErrorState(
  class {
    readonly stateChanges = new Subject<void>();

    constructor(
      public _defaultErrorStateMatcher: ErrorStateMatcher,
      public _parentForm: NgForm,
      public _parentFormGroup: FormGroupDirective,
      public ngControl: NgControl
    ) {
    }
  },
);

@Directive({
  selector: `input[iqInput], textarea[iqInput], select[iqNativeControl],
      input[iqNativeControl], textarea[iqNativeControl]`,
  exportAs: 'iqInput',
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    'class': 'hs-input-element hs-form-field-autofill-control',
    '[class.hs-mdc-native-select-inline]': '_isInlineSelect()',
    '[id]': 'id',
    '[disabled]': 'disabled',
    '[required]': 'required',
    '[attr.name]': 'name || null',
    '[attr.readonly]': 'readonly && !_isNativeSelect || null',
    '[attr.aria-invalid]': '(empty && required) ? null : errorState',
    '[attr.aria-required]': 'required',
    '[attr.id]': 'id',
    '(focus)': '_focusChanged(true)',
    '(blur)': '_focusChanged(false)',
    '(input)': '_onInput()',
  },
  providers: [{provide: HSFormFieldControl, useExisting: HSInputDirective}],
})
export class HSInputDirective extends HSInputBase implements HSFormFieldControl<any>, OnDestroy, DoCheck, CanUpdateErrorState {

  protected _uid = `hs-input-${nextUniqueId++}`;
  protected _previousNativeValue: any;

  private _inputValueAccessor: { value: any };
  private _previousPlaceholder!: string | null;

  readonly _isNativeSelect: boolean;
  readonly _isTextarea: boolean;
  readonly _isInFormField: boolean;

  focused = false;

  override readonly stateChanges: Subject<void> = new Subject<void>();

  controlType = 'hs-input';

  autofilled = false;

  @Input()
  get disabled(): boolean {
    if (this.ngControl && this.ngControl.disabled !== null) {
      return this.ngControl.disabled;
    }
    return this._disabled;
  }

  set disabled(value: BooleanInput) {
    this._disabled = coerceBooleanProperty(value);

    if (this.focused) {
      this.focused = false;
      this.stateChanges.next();
    }
  }

  protected _disabled = false;

  @Input()
  get id(): string {
    return this._id;
  }

  set id(value: string) {
    this._id = value || this._uid;
  }

  protected _id!: string;

  @Input() placeholder!: string;

  @Input() name!: string;

  @Input()
  get required(): boolean {
    return this._required ?? this.ngControl?.control?.hasValidator(Validators.required) ?? false;
  }

  set required(value: BooleanInput) {
    this._required = coerceBooleanProperty(value);
  }

  protected _required: boolean | undefined;

  @Input()
  get type(): string {
    return this._type;
  }

  set type(value: string) {
    this._type = value || 'text';
    this._validateType();

    if (!this._isTextarea && getSupportedInputTypes().has(this._type)) {
      (this._elementRef.nativeElement as HTMLInputElement).type = this._type;
    }
  }

  protected _type = 'text';

  @Input() override errorStateMatcher!: ErrorStateMatcher;

  @Input()
  get value(): string {
    return this._inputValueAccessor.value;
  }

  set value(value: any) {
    if (value !== this.value) {
      this._inputValueAccessor.value = value;
      this.stateChanges.next();
    }
  }

  @Input()
  get readonly(): boolean {
    return this._readonly;
  }

  set readonly(value: BooleanInput) {
    this._readonly = coerceBooleanProperty(value);
  }

  private _readonly = false;

  protected _neverEmptyInputTypes = [
    'date',
    'datetime',
    'datetime-local',
    'month',
    'time',
    'week',
  ].filter(t => getSupportedInputTypes().has(t));

  constructor(
    protected _elementRef: ElementRef<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    _defaultErrorStateMatcher: ErrorStateMatcher,
    @Optional() @Self() ngControl: NgControl,
    @Optional() _parentForm: NgForm,
    @Optional() _parentFormGroup: FormGroupDirective,
    @Optional() @Self() @Inject(HS_INPUT_VALUE_ACCESSOR) inputValueAccessor: any,
    @Optional() @Inject(HS_FORM_FIELD) protected _formField?: HSFormFieldComponent,
  ) {
    super(_defaultErrorStateMatcher, _parentForm, _parentFormGroup, ngControl);

    const element = this._elementRef.nativeElement;
    const nodeName = element.nodeName.toLowerCase();

    this._inputValueAccessor = inputValueAccessor || element;

    this._previousNativeValue = this.value;

    // eslint-disable-next-line no-self-assign
    this.id = this.id;

    this._isNativeSelect = nodeName === 'select';
    this._isTextarea = nodeName === 'textarea';
    this._isInFormField = !!_formField;

    if (this._isNativeSelect) {
      this.controlType = (element as HTMLSelectElement).multiple
        ? 'hs-native-select-multiple'
        : 'hs-native-select';
    }
  }

  // ngOnChanges() {
  //   this.stateChanges.next();
  // }

  ngOnDestroy(): void {
    this.stateChanges.complete();
  }

  ngDoCheck(): void {
    if (this.ngControl) {
      this.updateErrorState();
    }
    this._dirtyCheckNativeValue();
    this._dirtyCheckPlaceholder();
  }

  focus(options?: FocusOptions): void {
    this._elementRef.nativeElement.focus(options);
  }

  _focusChanged(isFocused: boolean): void {
    if (isFocused !== this.focused) {
      this.focused = isFocused;
      this.stateChanges.next();
    }
  }

  _onInput(): void {
    //
  }

  protected _dirtyCheckNativeValue(): void {
    const newValue = this._elementRef.nativeElement.value;

    if (this._previousNativeValue !== newValue) {
      this._previousNativeValue = newValue;
      this.stateChanges.next();
    }
  }

  private _dirtyCheckPlaceholder(): void {
    const placeholder = this._getPlaceholder();
    if (placeholder !== this._previousPlaceholder) {
      const element = this._elementRef.nativeElement;
      this._previousPlaceholder = placeholder;
      placeholder
        ? element.setAttribute('placeholder', placeholder)
        : element.removeAttribute('placeholder');
    }
  }

  protected _getPlaceholder(): string | null {
    return this.placeholder || null;
  }

  protected _validateType(): void {
    if (
      HS_INPUT_INVALID_TYPES.indexOf(this._type) > -1
      // (typeof ngDevMode === 'undefined' || ngDevMode)
    ) {
      throw getHSInputUnsupportedTypeError(this._type);
    }
  }

  protected _isNeverEmpty(): boolean {
    return this._neverEmptyInputTypes.indexOf(this._type) > -1;
  }

  protected _isBadInput(): boolean {
    const validity = (this._elementRef.nativeElement as HTMLInputElement).validity;
    return validity && validity.badInput;
  }

  get empty(): boolean {
    return (
      !this._isNeverEmpty() &&
      !this._elementRef.nativeElement.value &&
      !this._isBadInput() &&
      !this.autofilled
    );
  }

  onContainerClick(): void {
    if (!this.focused) {
      this.focus();
    }
  }

  _isInlineSelect(): boolean {
    const element = this._elementRef.nativeElement as HTMLSelectElement;
    return this._isNativeSelect && (element.multiple || element.size > 1);
  }
}
