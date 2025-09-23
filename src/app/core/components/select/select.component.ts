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

import {distinctUntilChanged, merge, Observable, Subscription} from 'rxjs';
import {debounceTime, findIndex, startWith, switchMap} from 'rxjs/operators';

import { SelectOptionChangeInterface } from './components/select-option/select-option.component';
import { HSSelectTriggerComponent } from './components/select-trigger/select-trigger.component';
import { HSSelectOptionComponent } from './components/select-option/select-option.component';
import { HS_SELECT_PARENT_COMPONENT } from './components/select-parent.component';
import { HSDropdownComponent } from './components/dropdown/dropdown.component';
import { HSFormFieldControl } from '../form-field/form-field-control';
import { HSSelectBaseMixin } from './select-base.mixin';
import { HSSelectChange } from './select-change';

@Component({
  selector: 'hs-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
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
  @ViewChild('searchInput') searchInput!: ElementRef;
  @ViewChild(HSDropdownComponent) dropdown!: HSDropdownComponent;
  @ContentChild(HSSelectTriggerComponent) selectTrigger!: HSSelectTriggerComponent;
  @ContentChildren(HSSelectOptionComponent, { descendants: true }) options!: QueryList<HSSelectOptionComponent>;

  @Input() isSearchApi = false;
  @Input() placeholder = '';
  @Input() isRounded = false;
  @Input() multiple = false;
  @Input() dropdownMinWidth!: number;
  @Input() dropdownMaxWidth!: number;
  @Input() dropdownMaxHeight = 214;
  @Input() offsetX = 0;
  @Input() enableSearch = false;
  @Input() onlyIcon = false;
  @Input() icon = 'icon-chevron-down_2';

  onContainerClick: any;
  focused = false;
  optionHeight = 36;
  searchedOptions!: any[];
  id = '';

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
  @Output() readonly searchChange: EventEmitter<string> = new EventEmitter<string>();
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

  selectionModel!: SelectionModel<HSSelectOptionComponent>;
  searchControl: FormControl = new FormControl('');
  isEmptySearchResult = false;

  private _value: any;
  private hoverValue = '';
  private hoverIndex = -1;
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

    this.listenKeyEvents();

    this.subscription.add(optionsValueChangeStream$);
    this.subscription.add(optionComponentsChangeStream$);
    this.subscription.add(selectionModelChangeStream$);

  }

  searchKeyDown(event): void {
    event.stopPropagation();

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.searchInput.nativeElement.blur();
      this._elementRef.nativeElement.focus();

      this.searchedOptions = this.options.filter((option: any) => !option.hidden);
      this.hoverIndex = -1;
      this.buttonArrowsEvent(event);

    }
  }

  private listenKeyEvents(): void {
    this._elementRef.nativeElement.addEventListener('keydown', (event) => {
      event.preventDefault();
      event.stopPropagation();

      this.searchedOptions = this.options.filter((option: any) => !option.hidden);
      if (this.hoverIndex == -1) {
        this.searchedOptions.forEach((option: any, index: number) => {
          if (this._value === option.optionValue) {
            this.hoverIndex = index;
            this.optionHeight = option.element.nativeElement.clientHeight;
          }
        });

      }

      if (this.hoverIndex === -1) {
        this.optionHeight = this.searchedOptions.find((option: any, index: number) => index === 0).element.nativeElement.clientHeight;
      }

      this.buttonArrowsEvent(event);

    });
  }

  buttonArrowsEvent(event): void {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      const isArrowDown = event.key === 'ArrowDown';
      const direction = isArrowDown ? 1 : -1;

      const newHoverIndex = this.hoverIndex + direction;
      if (isArrowDown && newHoverIndex < this.searchedOptions.length || !isArrowDown && newHoverIndex >= 0) {
        this.hoverIndex = newHoverIndex;
        this.handleHoverChange(isArrowDown);
      }
    } else if (event.key === 'Enter' && this.hoverIndex !== -1) {
      const selectedOption = this.searchedOptions.find((option, index) => index === this.hoverIndex);
      if (selectedOption) {
        this._value = selectedOption.value;
        selectedOption.selectionByClick();
        this.dropdown.hide();
      }
    }
  }

  private handleHoverChange(isArrowDown: boolean): void {
    this.removeOptionsHover();
    const selectedOption = this.searchedOptions.find((option, index) => index === this.hoverIndex);
    if (selectedOption) {
      selectedOption.addHover();

      const dropdownContainer = document.getElementsByClassName('hs-dropdown-container')[0] as HTMLElement;
      if (dropdownContainer) {
        if (isArrowDown) {
          dropdownContainer.scrollTop = (this.optionHeight) * this.hoverIndex;
        } else {
          dropdownContainer.scrollTop = (this.optionHeight * this.hoverIndex) - this.optionHeight;
        }

      }
    }
  }

  onMouseMove(): void {
    this.hoverIndex = -1;
    this.removeOptionsHover();
  }

  removeOptionsHover(): void {
    this.options.forEach((option: any) => {
      option.removeHover();
    });
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
    // this.dropdown.hide();
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

    if (isOpening) {
      this.options.forEach((option: any, index: number) => {
        if (option.optionValue === this._value) {
          this.hoverIndex = index;
        }
      })
    }

    if (!isOpening) {
      this.searchControl.setValue('');
      this.updateErrorState();
      this.blurEvent();
      this.hoverIndex = -1;
      this.removeOptionsHover();
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
    const stream$ = this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((searchVal) => {
      if(this.isSearchApi) {
        this.searchChange.emit(searchVal);
        return;
      }
      this.hoverIndex = -1;
      this.removeOptionsHover();

      this.isEmptySearchResult = true;
      this.options.forEach((item: HSSelectOptionComponent) => {
        item.hidden = !item.viewValue.toLowerCase().includes(searchVal.toLowerCase());
        if (!item.hidden) {
          this.isEmptySearchResult = false;
        }
      });
    });

    this.subscription.add(stream$);
  }
}
