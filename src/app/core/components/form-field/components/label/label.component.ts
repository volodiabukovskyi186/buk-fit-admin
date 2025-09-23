import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'hs-label',
  templateUrl: 'label.component.html',
  styleUrls: ['label.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HSLabelComponent {
  @Input() hint = '';
}
