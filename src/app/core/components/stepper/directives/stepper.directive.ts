import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[adHost]',
})
export class HSAdDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}