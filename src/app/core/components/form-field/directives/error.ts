import { Directive, ElementRef, Inject, InjectionToken, Input } from '@angular/core';
import { DOCUMENT } from '@angular/common';

let nextUniqueId = 0;

export const HS_ERROR = new InjectionToken<HSErrorDirective>('HSErrorDirective');

@Directive({
  selector: 'hs-error, [iqError]',
  host: {
    'class': 'hs-mdc-form-field-error hs-mdc-form-field-bottom-align',
    '[id]': 'id',
  },
  providers: [{provide: HS_ERROR, useExisting: HSErrorDirective}],
})
export class HSErrorDirective {
  @Input() id: string = `hs-mdc-error-${nextUniqueId++}`;

  constructor(private elementRef: ElementRef,
              @Inject(DOCUMENT) private document: Document
  ) {
    this.appendIcon();
  }

  private appendIcon(): void {
    const i = this.document.createElement('i');
    i.classList.add('hs-icon','hs-icon-warning');

    this.elementRef.nativeElement.append(i);
  }
}
