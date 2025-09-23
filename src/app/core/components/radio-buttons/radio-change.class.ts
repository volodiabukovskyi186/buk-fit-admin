/**
 * Used to emit changes performed on a `Radio`.
 */
import { HSRadioButtonComponent } from './radio-button/radio-button.component';

export class RadioChange<T = any> {
  /** Contains the `Radio` that has been changed */
  source: HSRadioButtonComponent<T> | null;

  /** The value of the `Radio` encompassed in the `RadioChange` class */
  value: T;

  constructor(source: HSRadioButtonComponent<T>, value: T) {
    this.source = source;
    this.value = value;
  }
}
