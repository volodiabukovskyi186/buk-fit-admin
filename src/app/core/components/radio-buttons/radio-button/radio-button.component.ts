import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostBinding } from '@angular/core';
import { Input, OnInit, Output, ViewEncapsulation } from '@angular/core';

import { RadioChange } from '../radio-change.class';


@Component({
  selector: 'hs-radio-button',
  templateUrl: './radio-button.component.html',
  styleUrls: ['./radio-button.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
  ],
})
export class HSRadioButtonComponent<T = any> implements OnInit {
  @Input() set size(size: number) {
    this.el.nativeElement.style.setProperty(
      '--hs-radio-button-size',
      `${size || 14}px`
    );
  }

  @Input() disabled = false;
  @Input() name = '';
  @Input() value: any;
  @Input() checked = false;

  @Output() valueChange = new EventEmitter<RadioChange<T>>();

  @HostBinding('class')
  get radioButtonClass(): string {
    return 'hs-radio-button';
  }

  constructor(private el: ElementRef, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.el.nativeElement.style.setProperty(
      '--hs-radio-button-size',
      `${18}px`
    );
  }

  onChange(event: Event): void {
    event.stopPropagation();
  }

  onClick(event: Event): void {
    if (this.checked || this.disabled) {return;}

    this.checked = (event.target as HTMLInputElement).checked;
    const radioEvent = new RadioChange(this, this.value);
    this.valueChange.emit(radioEvent);
    this.radioChangeHandler(radioEvent);
  }

  registerRadioChangeHandler(fn: (event: RadioChange<T>) => void): void {
    this.radioChangeHandler = fn;
  }

  markForCheck(): void {
    this.cdr.markForCheck();
  }

  private radioChangeHandler = (event: RadioChange<T>): void => {};
}
