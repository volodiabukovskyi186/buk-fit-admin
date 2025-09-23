import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'iq-menu-item',
  templateUrl: './menu-item.component.html',
  styleUrls: ['./menu-item.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class IQMenuItemComponent {
  @Input() isSelected = false;
  @Input() color: 'default' | 'error' = 'default';

}
