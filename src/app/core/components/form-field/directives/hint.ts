import { Directive, InjectionToken, Input } from '@angular/core';

let nextUniqueId = 0;

export const HS_HINT = new InjectionToken<HSHintDirective>('HSHintDirective');

@Directive({
  selector: 'hs-hint',
  host: {
    'class': 'hs-hint',
    '[class.hs-form-field-hint-end]': 'align === "end"',
    '[attr.id]': 'id',
    // Remove align attribute to prevent it from interfering with layout.
    '[attr.align]': 'null',
  },
  providers: [{provide: HS_HINT, useExisting: HSHintDirective}],
})
export class HSHintDirective {
  @Input() align: 'start' | 'end' = 'start';
  @Input() id = `hs-hint-${nextUniqueId++}`;
}
