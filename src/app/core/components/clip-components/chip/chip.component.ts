import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { ChipChange } from '../chip.change.class';
import { SafeStyle } from '@angular/platform-browser';

export enum ChipModeEnum  {
  default = 'default',
  primaryLight = 'primary-light',
}

@Component({
  selector: 'hs-chip-ui',
  templateUrl: './chip.component.html',
  styleUrls: ['./chip.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ChipComponent<T = string> implements OnInit {
  @Input()
  value: any;
  @Input()
  disabled: boolean;
  @Input()
  removable = false;
  @Input()
  selectable: boolean;
  @Input()
  selected = false;
  @Input() mode = ChipModeEnum.default

  // @Input() background ='';
  backgroundColor = ''
  @Input()
  set background(value : any) {
   this.backgroundColor = value;
   this.setBackgroundColor();

  }


  @Output() onRemove = new EventEmitter<ChipChange<T>>();
  @Output() onSelect = new EventEmitter<ChipChange<T>>();

  @HostBinding('class')
  get chipClass(): string {
    return `hs-chip`;
  }

  // @HostBinding('class')
  // get chipColorClass(): string {
  //   return `hs-chip-mode-${this.mode}`;
  // }

  constructor(
    private cdr: ChangeDetectorRef,
    private el: ElementRef,
    ) {}

  ngOnInit(): void {
    if(this.mode === ChipModeEnum.primaryLight) {
      this.backgroundColor = 'rgba(63, 161, 251, 0.10)';
    }
    this.setBackgroundColor();
  }

  setBackgroundColor(): void {    
    this.el.nativeElement.style.setProperty(
      '--hs-chip-background',
      `${this.backgroundColor !== '' ? this.backgroundColor : 'rgba(37, 37, 37, 0.10)'}`
    );
  }

  removeChip(): void {
    if (!this.disabled) {
      const deleteEvent = new ChipChange(
        this,
        this.value,
        this.selectable,
        this.selected
      );
      this.onRemove.emit(deleteEvent);
      this.deleteChipHandler(deleteEvent);
    }
  }

  selectChip(): void {
    if (this.selectable && !this.disabled) {
      const selectEvent = new ChipChange(
        this,
        this.value,
        this.selectable,
        this.selected
      );
      this.onSelect.emit(selectEvent);
      this.selectChipHandler(selectEvent);
    }
  }

  registerChipDeleteHandler(fn: (event: ChipChange<T>) => void): void {
    this.deleteChipHandler = fn;
  }

  registerChipSelectHandler(fn: (event: ChipChange<T>) => void): void {
    this.selectChipHandler = fn;
  }

  markForCheck(): void {
    this.cdr.markForCheck();
  }

  private selectChipHandler = (event: ChipChange<T>): void => {};
  private deleteChipHandler = (event: ChipChange<T>): void => {};
}
