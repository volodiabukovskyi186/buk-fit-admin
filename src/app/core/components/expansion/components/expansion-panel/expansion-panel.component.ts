import { ElementRef, EventEmitter, Inject, Input, OnChanges, OnDestroy, Optional } from '@angular/core';
import { Output, SimpleChanges, SkipSelf, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { UniqueSelectionDispatcher } from '@angular/cdk/collections';
import { CdkAccordionItem } from '@angular/cdk/accordion';
import { DOCUMENT } from '@angular/common';
import { ViewChild } from '@angular/core';

import { distinctUntilChanged, Subject } from 'rxjs';

import { HSAccordionBase, HS_ACCORDION } from '../accordion/accordion-base';
import { expansionAnimations } from '../../expansion.animations';

export type HSExpansionPanelState = 'expanded' | 'collapsed';
export type HSAccordionTogglePosition = 'before' | 'after';

let unHSueId = 0;

@Component({
  selector: 'hs-expansion-panel',
  templateUrl: './expansion-panel.component.html',
  styleUrls: ['./expansion-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  inputs: ['disabled', 'expanded'],
  outputs: ['opened', 'closed', 'expandedChange'],
  animations: [expansionAnimations],
  providers: [
    { provide: HS_ACCORDION, useValue: undefined },
    // { provide: MAT_EXPANSION_PANEL, useExisting: MatExpansionPanel },
  ],
  host: {
    'class': 'hs-expansion-panel',
    '[class.hs-expanded]': 'expanded',
    '[class.hs-expansion-panel-spacing]': '_hasSpacing()',
  },
})
export class HSExpansionPanelComponent extends CdkAccordionItem implements OnChanges, OnDestroy {

  /** Whether the toggle indicator should be hidden. */
  @Input()
  get hideToggle(): boolean {
    return this._hideToggle;
    // return this._hideToggle || (this.accordion && this.accordion.hideToggle);
  }
  set hideToggle(value: BooleanInput) {
    this._hideToggle = coerceBooleanProperty(value);
  }

  /** The position of the expansion indicator. */
  @Input()
  get togglePosition(): HSAccordionTogglePosition {
    return this._togglePosition;
    // return this._togglePosition || (this.accordion && this.accordion.togglePosition);
  }
  set togglePosition(value: HSAccordionTogglePosition) {
    this._togglePosition = value;
  }

  @Output() readonly afterCollapse = new EventEmitter<void>();
  @Output() readonly afterExpand = new EventEmitter<void>();

  /** Stream that emits for changes in `@Input` properties. */
  readonly _inputChanges = new Subject<SimpleChanges>();


  /** Optionally defined accordion the expansion panel belongs to. */
  // @ts-ignore
  override accordion: HSAccordionBase;

  /** Element containing the panel's user-provided content. */
  @ViewChild('body') _body!: ElementRef<HTMLElement>;

  /** ID for the associated header element. Used for a11y labelling. */
  _headerId = `hs-expansion-panel-header-${unHSueId++}`;

  private _document: Document;
  private _hideToggle = false;
  private _togglePosition!: HSAccordionTogglePosition;

  /** Stream of body animation done events. */
  readonly _bodyAnimationDone = new Subject<any>();

  constructor(
    @Optional() @SkipSelf() @Inject(HS_ACCORDION) _accordion: HSAccordionBase,
    @Inject(DOCUMENT) _document: any,

    private _viewContainerRef: ViewContainerRef,

    _UniqueSelectionDispatcher: UniqueSelectionDispatcher,
    _changeDetectorRef: ChangeDetectorRef,
  ) {
    super(_accordion, _changeDetectorRef, _UniqueSelectionDispatcher);
    this.accordion = _accordion;
    this._document = _document;

    // We need a Subject with distinctUntilChanged, because the `done` event
    // fires twice on some browsers. See https://github.com/angular/angular/issues/24084
    this._bodyAnimationDone
      .pipe(
        distinctUntilChanged((x: any, y) => {
          return x.fromState === y.fromState && x.toState === y.toState;
        }),
      )
      .subscribe(event => {
        if (event.fromState !== 'void') {
          if (event.toState === 'expanded') {
            this.afterExpand.emit();
          } else if (event.toState === 'collapsed') {
            this.afterCollapse.emit();
          }
        }
      });
  }

  /** Determines whether the expansion panel should have spacing between it and its siblings. */
  _hasSpacing(): boolean {
    if (this.accordion) {
      return this.expanded && this.accordion.displayMode === 'default';
    }
    return false;
  }

  /** Gets the expanded state string. */
  _getExpandedState(): HSExpansionPanelState {
    return this.expanded ? 'expanded' : 'collapsed';
  }

  /** Toggles the expanded state of the expansion panel. */
  override toggle(): void {
    this.expanded = !this.expanded;
  }

  /** Sets the expanded state of the expansion panel to false. */
  override close(): void {
    this.expanded = false;
  }

  /** Sets the expanded state of the expansion panel to true. */
  override open(): void {
    this.expanded = true;
  }

  ngOnChanges(changes: SimpleChanges) {
    this._inputChanges.next(changes);
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this._bodyAnimationDone.complete();
    this._inputChanges.complete();
  }

  /** Checks whether the expansion panel's content contains the currently-focused element. */
  _containsFocus(): boolean {
    if (this._body) {
      const focusedElement = this._document.activeElement;
      const bodyElement = this._body.nativeElement;
      return focusedElement === bodyElement || bodyElement.contains(focusedElement);
    }

    return false;
  }
}
