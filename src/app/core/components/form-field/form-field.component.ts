import {
  AfterContentChecked,
  AfterContentInit,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild, ContentChildren, ElementRef, InjectionToken, Input, OnChanges, OnDestroy, QueryList,
  SimpleChanges,
  ViewEncapsulation
} from '@angular/core';
import { AbstractControlDirective } from '@angular/forms';

import { Subject, takeUntil } from 'rxjs';
import { startWith } from 'rxjs/operators';

import { HSErrorDirective, HS_ERROR } from './directives/error';
import { HSHintDirective, HS_HINT } from './directives/hint';
import { HSPrefixDirective, HS_PREFIX } from './directives/prefix';
import { HS_SUFFIX, HSSuffixDirective } from './directives/suffix';

import { HSFormFieldControl } from './form-field-control';

export const HS_FORM_FIELD = new InjectionToken<HSFormFieldComponent>('HSFormFieldComponent');

let nextUniqueId = 0;
@Component({
  selector: 'hs-form-field',
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.scss'],
  host: {
    'class': 'hs-form-field',
    '[class.hs-form-field-invalid]': '_control.errorState',
    '[class.hs-form-field-disabled]': '_control.disabled',
    '[class.hs-form-field-autofilled]': '_control.autofilled',
    '[class.hs-focused]': '_control.focused',
    '[class.ng-untouched]': '_shouldForward("untouched")',
    '[class.ng-touched]': '_shouldForward("touched")',
    '[class.ng-pristine]': '_shouldForward("pristine")',
    '[class.ng-dirty]': '_shouldForward("dirty")',
    '[class.ng-valid]': '_shouldForward("valid")',
    '[class.ng-invalid]': '_shouldForward("invalid")',
    '[class.ng-pending]': '_shouldForward("pending")',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{provide: HS_FORM_FIELD, useExisting: HSFormFieldComponent}],
})
export class HSFormFieldComponent implements AfterViewInit, OnChanges , AfterContentInit, AfterContentChecked, OnDestroy {
  @ContentChildren(HS_SUFFIX, {descendants: true}) _suffixChildren!: QueryList<HSSuffixDirective>;
  @ContentChildren(HS_PREFIX, {descendants: true}) _prefixChildren!: QueryList<HSPrefixDirective>;
  @ContentChildren(HS_ERROR, {descendants: true}) _errorChildren!: QueryList<HSErrorDirective>;
  @ContentChildren(HS_HINT, {descendants: true}) _hintChildren!: QueryList<HSHintDirective>;

  @ContentChild(HSFormFieldControl) _controlNonStatic!: HSFormFieldControl<any>;
  @ContentChild(HSFormFieldControl, {static: true}) _controlStatic!: HSFormFieldControl<any>;

  get _control() {    
    return this._explicitFormFieldControl || this._controlNonStatic || this._controlStatic;
  }

  set _control(value) { 
    this._explicitFormFieldControl = value;
  }

  @Input()
  get hintLabel(): string {
    return this._hintLabel;
  }

  set hintLabel(value: string) {
    this._hintLabel = value;
    this._processHints();
  }

  @Input() isDisabled = false;

  private _hintLabel = '';

  readonly _hintLabelId: string = `hs-hint-${nextUniqueId++}`;

  private _explicitFormFieldControl!: HSFormFieldControl<any>;

  private readonly _destroyed = new Subject<void>();

  constructor(
    private _elementRef: ElementRef,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['isDisabled']) {
     this.setIsDisabled(changes['isDisabled'].currentValue);
    }
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  ngAfterContentInit(): void {
    this._validateControlChild();
    const control = this._control;

    if (control.controlType) {
      this._elementRef.nativeElement.classList.add(`hs-form-field-type-${control.controlType}`);
    }



    control.stateChanges.pipe(startWith(null)).subscribe(() => {
      // this._validatePlaceholders();
      // this._syncDescribedByIds();
      this.cdr.markForCheck();
    });

    if (control.ngControl && control.ngControl.valueChanges) {
      control.ngControl.valueChanges
        .pipe(takeUntil(this._destroyed))
        .subscribe(() => this.cdr.markForCheck());
    }
  }

  ngAfterContentChecked(): void {
    this._validateControlChild();
  }

  _shouldForward(prop: keyof AbstractControlDirective): boolean {
    const control = this._control ? this._control.ngControl : null;
    return control && control[prop];
  }

  _getDisplayedMessages(): 'error' | 'hint' {
    return this._errorChildren && this._errorChildren.length > 0 && this._control.errorState
      ? 'error'
      : 'hint';
  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }

  private setIsDisabled(isDisabled): void {
    setTimeout(()=> {
      if (isDisabled) {
        this._elementRef.nativeElement.classList.add(`hs-form-field-disabled`);
       } else {
         this._elementRef.nativeElement.classList.remove(`hs-form-field-disabled`);
       }
    });
  }

  protected _validateControlChild(): void {
    if (!this._control) {
      throw getHSFormFieldMissingControlError();
    }
  }

  private _processHints(): void {
    this._validateHints();
  }

  private _validateHints(): void {
    if (this._hintChildren) {
      let startHint: HSHintDirective;
      let endHint: HSHintDirective;
      this._hintChildren.forEach((hint: HSHintDirective) => {
        if (hint.align === 'start') {
          if (startHint || this.hintLabel) {
            throw getHSFormFieldDuplicatedHintError('start');
          }
          startHint = hint;
        } else if (hint.align === 'end') {
          if (endHint) {
            throw getHSFormFieldDuplicatedHintError('end');
          }
          endHint = hint;
        }
      });
    }
  }
}

export function getHSFormFieldMissingControlError(): Error {
  return Error('hs-form-field must contain a HSFormFieldControl.');
}

export function getHSFormFieldDuplicatedHintError(align: string): Error {
  return Error(`A hint was already declared for 'align="${align}"'.`);
}
