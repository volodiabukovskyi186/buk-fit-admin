import { Directive, ElementRef, InjectionToken } from '@angular/core';

export const HS_PREFIX = new InjectionToken<HSPrefixDirective>('HSPrefixDirective');

@Directive({
  selector: '[iqPrefix], [iqIconPrefix], [iqTextPrefix]',
  providers: [{provide: HS_PREFIX, useExisting: HSPrefixDirective}],
})
export class HSPrefixDirective {
  _isText = false;

  constructor(elementRef: ElementRef) {
    this._isText = elementRef.nativeElement.hasAttribute('iqTextPrefix');
  }
}
