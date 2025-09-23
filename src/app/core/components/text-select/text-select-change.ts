import { HSSelectComponent } from './text-select.component';

export class HSSelectChange<T = any> {
  constructor(
    public source: HSSelectComponent,
    public value: T
  ) {
  }
}
