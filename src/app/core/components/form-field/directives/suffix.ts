import { Directive, ElementRef, InjectionToken } from '@angular/core';

export const HS_SUFFIX = new InjectionToken<HSSuffixDirective>('HSSuffixDirective');

@Directive({
  selector: '[iqSuffix], [iqIconSuffix], [iqTextSuffix]',
  providers: [{provide: HS_SUFFIX, useExisting: HSSuffixDirective}],
})
export class HSSuffixDirective {
  _isText = false;

  constructor(elementRef: ElementRef) {
    this._isText = elementRef.nativeElement.hasAttribute('iqTextSuffix');
  }
}
