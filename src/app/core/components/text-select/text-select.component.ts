import {
  AfterViewInit,
  Attribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ContentChildren,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  Optional, Output,
  QueryList,
  Self,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroupDirective, NgControl, NgForm, Validators } from '@angular/forms';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { ErrorStateMatcher } from '@angular/material/core';
import { SelectionModel } from '@angular/cdk/collections';

import { merge, Observable, Subscription } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';

import { SelectOptionChangeInterface } from './components/text-select-option/text-select-option.component';
import { HSSelectTriggerComponent } from './components/text-select-trigger/select-trigger.component';
import { HSSelectOptionComponent } from './components/text-select-option/text-select-option.component';
import { HS_SELECT_PARENT_COMPONENT } from './components/text-select-parent.component';
import { HSDropdownComponent } from './components/text-dropdown/text-dropdown.component';
import { HSFormFieldControl } from '../form-field/form-field-control';
import { HSSelectBaseMixin } from './text-select-base.mixin';
import { HSSelectChange } from './text-select-change';

export enum ICON_ALIGN_ENUM { 
  left = 'left',
  right = 'right'
}

@Component({
  selector: 'hs-text-select',
  templateUrl: './text-select.component.html',
  styleUrls: ['./text-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  inputs: ['disabled'],
  host: {
    'role': 'combobox',
    '[attr.tabindex]': 'tabIndex',
    '(focus)': 'focusEvent()',
    '(blur)': 'blurEvent()',
  },
  providers: [
    { provide: HSFormFieldControl, useExisting: HSSelectComponent },
    { provide: HS_SELECT_PARENT_COMPONENT, useExisting: HSSelectComponent }
  ],
})
export class HSSelectComponent extends HSSelectBaseMixin implements HSFormFieldControl<any>, ControlValueAccessor, OnInit, AfterViewInit, OnDestroy {

  @ViewChild('input') input!: ElementRef;
  @ViewChild(HSDropdownComponent) dropdown!: HSDropdownComponent;
  @ContentChild(HSSelectTriggerComponent) selectTrigger!: HSSelectTriggerComponent;
  @ContentChildren(HSSelectOptionComponent, { descendants: true }) options!: QueryList<HSSelectOptionComponent>;

  @Input() iconAlign = ICON_ALIGN_ENUM.right;
  @Input() placeholder = 'Select';
  @Input() isRounded = false;
  @Input() multiple = false;
  @Input() dropdownMinWidth!: number;
  @Input() dropdownMaxHeight = 214;
  @Input() offsetX = 0;
  @Input() enableSearch = false;

  onContainerClick: any;
  iconAlignEnum = ICON_ALIGN_ENUM;
  focused = false;
  id = '';

  @HostBinding('style.--hs-text-select-color-text')
  get colorStyle(): string {
    return this.color;
  }

  @HostBinding('style.--hs-text-select-color-icon')
  get colorIconStyle(): string {
    return this.color ? this.color : '#25252561';
  }

  @Input()
  get required(): boolean {
    return this._required ?? this.ngControl?.control?.hasValidator(Validators.required) ?? false;
  }
  set required(value: BooleanInput) {
    this._required = coerceBooleanProperty(value);
    this.stateChanges.next();
  }
  private _required: boolean | undefined;

  @Input()
  set value(newValue: any) {
    if (newValue !== this._value || (this.multiple && Array.isArray(newValue))) {
      if (this.options) {
        this.setSelectionByValue(newValue);
      }

      this._value = newValue;
    }
  }

  get value(): any {
    return this._value;
  }

  @Input()
  set compareWith(fn: (o1: any, o2: any) => boolean) {
    if (typeof fn !== 'function') {
      console.error('Incorrect compareWith function');
    }
    this._compareWith = fn;
    if (this.selectionModel) {
      this.initializeSelection();
    }
  }

  get compareWith() {
    return this._compareWith;
  }

  @Output() readonly openedChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() readonly scrollEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() readonly selectionChange: EventEmitter<HSSelectChange> = new EventEmitter<HSSelectChange>();

  get selected(): HSSelectOptionComponent | HSSelectOptionComponent[] {
    return this.multiple ? (this.selectionModel?.selected || []) :
      this.selectionModel?.selected[0];
  }

  get triggerValue(): string {
    if (this.empty) {
      return '';
    }

    if (this.multiple) {
      const selectedOptions = this.selectionModel.selected.map(option => option.viewValue);
      
      return selectedOptions.join(', ');
    }
    
    return this.selectionModel.selected[0].viewValue;
  }

  get empty(): boolean {
    return !this.selectionModel || this.selectionModel.isEmpty();
  }

  get isDropDownOpen(): boolean {
    return this.dropdown?.showing || false;
  }

  get color(): string {
    return  this.selectionModel.selected[0]?.color ? this.selectionModel.selected[0]?.color : '';
  }

  selectionModel!: SelectionModel<HSSelectOptionComponent>;
  searchControl: FormControl = new FormControl('');
  isEmptySearchResult = false;

  private _value: any;
  private subscription: Subscription = new Subscription();

  private _compareWith = (o1: any, o2: any) => o1 === o2;

  constructor(
    @Optional() _parentFormGroup: FormGroupDirective,
    @Self() @Optional() ngControl: NgControl,
    @Optional() _parentForm: NgForm,
    private changeDetectorRef: ChangeDetectorRef,
    _defaultErrorStateMatcher: ErrorStateMatcher,
    _elementRef: ElementRef,
    @Attribute('tabindex') tabIndex: string,
  ) {
    super(_elementRef, _defaultErrorStateMatcher, _parentForm, _parentFormGroup, ngControl);

    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }

    this.tabIndex = parseInt(tabIndex) || 0;
  }

  ngOnInit(): void {
    this.selectionModel = new SelectionModel<HSSelectOptionComponent>(this.multiple);
    this.searchControlValueChangeSubscription();
  }

  ngAfterViewInit(): void {
    const optionsValueChangeStream$ = this.optionsValueChange().subscribe((optionChange: SelectOptionChangeInterface) => {
      this.onSelect(optionChange.source);
      if (!this.multiple) {
        this.dropdown.hide();
      }
    });

    const optionComponentsChangeStream$ = this.options.changes.pipe(
      startWith(null)
    ).subscribe(() => this.initializeSelection());

    const selectionModelChangeStream$ = this.selectionModel.changed.pipe().subscribe(event => {
      event.added.forEach(option => option.select());
      event.removed.forEach(option => option.deselect());
    });

    this.subscription.add(optionsValueChangeStream$);
    this.subscription.add(optionComponentsChangeStream$);
    this.subscription.add(selectionModelChangeStream$);
  }

  focusEvent(): void {
    if (!this.disabled) {
      this.focused = true;
      this.stateChanges.next();
    }
  }

  blurEvent(): void {
    this.focused = false;

    if (!this.disabled && !this.isDropDownOpen) {
      this.onTouchedFn();
      this.stateChanges.next();
      this.changeDetectorRef.markForCheck();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onChangeFn = (_: any) => {
  };

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onTouchedFn = () => {
  };

  registerOnChange(fn: any): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouchedFn = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  writeValue(value: any): void {
    this.value = value;
  }

  onTouched(): void {
    this.onTouchedFn();
  }

  onChange(value: any): void {
    this.onChangeFn(value);
  }

  toggle(): void {
    this.isDropDownOpen ? this.closeDropdown() : setTimeout(() => this.openDropdown());

    if (!this.isDropDownOpen) {
      this.focusEvent();
    }
  }

  closeDropdown(): void {
    this.dropdown.hide();
  }

  openDropdown(): void {
    if (!this.isDropDownOpen && !this.disabled && this.options?.length > 0) {
      this.showDropdown();
    }
  }

  showDropdown(): void {
    this.dropdown.show();
  }

  onDropMenuIconClick(event: UIEvent): void {
    event.stopPropagation();
    setTimeout(() => {
      this.input.nativeElement.focus();
      this.input.nativeElement.click();
    }, 10);
  }

  dropdownOpeningChange(isOpening: boolean) {
    this.openedChange.emit(isOpening);

    if (!isOpening) {
      this.searchControl.setValue('');
      this.updateErrorState();
      this.blurEvent();
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private initializeSelection(): void {
    Promise.resolve().then(() => {
      this.setSelectionByValue(this.ngControl ? this.ngControl.value : this._value);
    });
  }

  private optionsValueChange(): Observable<any> {
    const options = this.options;

    return options.changes.pipe(
      startWith(options),
      switchMap(() => merge(...options.map((option: HSSelectOptionComponent) => option.onSelectionChange)))
    );
  }

  private onSelect(option: HSSelectOptionComponent): void {
    const wasSelected = this.selectionModel.isSelected(option);

    if (option.value == null && !this.multiple) {
      option.deselect();
      this.selectionModel.clear();

      if (this.selected != null) {
        this.propagateChanges(option.value);
      }
    } else {
      if (wasSelected !== option.selected) {
        option.selected ? this.selectionModel.select(option) :
          this.selectionModel.deselect(option);
      }
    }

    if (wasSelected !== this.selectionModel.isSelected(option)) {
      this.propagateChanges();
    }

    this.changeDetectorRef.detectChanges();
  }

  private propagateChanges(fallbackValue?: any): void {
    let valueToEmit: any = null;

    if (this.multiple) {
      valueToEmit = (this.selected as HSSelectOptionComponent[]).map(option => option.value);
    } else {
      valueToEmit = this.selected ? (this.selected as HSSelectOptionComponent).value : fallbackValue;
    }

    this.onChange(valueToEmit);
    this.updateErrorState();
    this.selectionChange.emit(new HSSelectChange(this, valueToEmit));
  }

  private setSelectionByValue(value: any | any[]): void {
    this.selectionModel.clear();

    if (this.multiple && value) {
      if (!Array.isArray(value)) {
        console.error('Value must be an array in multiple-selection mode.');
      }

      value.forEach((currentValue: any) => this.selectValue(currentValue));

    } else {
      this.selectValue(value);
    }

    this.changeDetectorRef.detectChanges();
  }

  private selectValue(value: any): HSSelectOptionComponent | undefined {
    const correspondingOption = this.options.find((option: HSSelectOptionComponent) => {
      if (this.selectionModel.isSelected(option)) {
        return false;
      }

      try {
        return option.value != null && this._compareWith(option.value, value);
      } catch (error) {
        return false;
      }
    });

    if (correspondingOption) {
      this.selectionModel.select(correspondingOption);
    }

    return correspondingOption;
  }

  private searchControlValueChangeSubscription(): void {
    const stream$ = this.searchControl.valueChanges.subscribe((searchVal) => {
      this.isEmptySearchResult = true;
      this.options.forEach((item: HSSelectOptionComponent) => {
        item.hidden = !item.viewValue.toLowerCase().includes(searchVal);
        if (!item.hidden) {
          this.isEmptySearchResult = false;
        }
      });

    });

    this.subscription.add(stream$);
  }
}
