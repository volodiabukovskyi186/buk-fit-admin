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
  ViewEncapsulation
} from '@angular/core';
import {
  HS_SELECT_PARENT_COMPONENT,
  HSSelectParentComponent
} from '../text-select-parent.component';

export interface SelectOptionChangeInterface {
  source: HSSelectOptionComponent,
  isUserInteraction: boolean
}

@Component({
  selector: 'hs-text-select-option',
  templateUrl: './text-select-option.component.html',
  styleUrls: ['./text-select-option.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class HSSelectOptionComponent {
  @Input() value: any;
  @Input() disabled = false;
  @Input() hidden = false;
  @Input() color = null;

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

  get viewValue(): string {
    return (this.el?.nativeElement?.textContent || '').trim();
  }

  get selected(): boolean {
    return this._selected;
  }

  selectComponent: HSSelectParentComponent;

  private _selected = false;

  constructor(
    @Optional() @Inject(HS_SELECT_PARENT_COMPONENT) select: HSSelectParentComponent,
    private el: ElementRef
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
