import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Inject,
  Input,
  Optional,
  Output,
  Renderer2,
  ViewEncapsulation
} from '@angular/core';
import {
  HS_SELECT_PARENT_COMPONENT,
  HSSelectParentComponent
} from '../select-parent.component';

export interface SelectOptionChangeInterface {
  source: HSSelectOptionComponent,
  isUserInteraction: boolean
}

@Component({
  selector: 'hs-select-option',
  templateUrl: './select-option.component.html',
  styleUrls: ['./select-option.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class HSSelectOptionComponent {
  @Input() value: any;
  @Input() disabled = false;
  @Input() hidden = false;

  @Output() onSelectionChange = new EventEmitter<SelectOptionChangeInterface>();

  @HostBinding('class.selected')
  get selectedClass(): boolean {
    return this._selected;
  }

  @HostBinding('class.disabled')
  get disabledClass(): boolean {
    return this.disabled;
  }

  @HostBinding('class.option-hidden')
  get hiddenClass(): boolean {
    return this.hidden;
  }

  get multiple(): boolean {
    return this.selectComponent?.multiple || false;
  }

  get optionValue(): boolean {
    return this.value || null;
  }

  get viewValue(): string {
    return (this.el?.nativeElement?.textContent || '').trim();
  }

  get selected(): boolean {
    return this._selected;
  }

  get element(): any {
    return this.el;
  }

  selectComponent: HSSelectParentComponent;

  private _selected = false;

  constructor(
    @Optional() @Inject(HS_SELECT_PARENT_COMPONENT) select: HSSelectParentComponent,
    private el: ElementRef,
    private renderrer: Renderer2,
  ) {
    this.selectComponent = select;
  }

  @HostListener('click', ['$event'])
  onClick(event: UIEvent): void {
    event.preventDefault();
    event.stopPropagation();

    this.selectionByClick();
  }

  select(): void {
    if (!this._selected) {
      this._selected = true;
      this.emitSelectionChangeEvent();
    }
  }

  deselect(): void {
    if (this._selected) {
      this._selected = false;
      // this.emitSelectionChangeEvent();
    }
  }

  addHover(): void  {
    this.renderrer.addClass(this.el.nativeElement, 'element-hover')
  }

  removeHover(): void  {
    this.renderrer.removeClass(this.el.nativeElement, 'element-hover')
  }

  selectionByClick(): void {
    if (!this.disabled) {
      this._selected = this.multiple ? !this._selected : true;
      this.emitSelectionChangeEvent(true);
    }
  }

  private emitSelectionChangeEvent(isUserInteraction = false): void {
    this.onSelectionChange.emit({
      isUserInteraction,
      source: this
    });
  }
}
