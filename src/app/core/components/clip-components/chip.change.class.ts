import { ChipComponent } from './chip/chip.component';

export class ChipChange<T = string> {
  source: ChipComponent<T> | null;
  value: T;
  selectable: boolean;
  selected: boolean;

  constructor(source: ChipComponent<T>, value: T, selectable: boolean, selected: boolean) {
    this.source = source;
    this.value = value;
    this.selectable = selectable;
    this.selected = selected;
  }
}
