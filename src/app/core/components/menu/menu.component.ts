import { ChangeDetectionStrategy, Component, EventEmitter, Input } from '@angular/core';
import { Output, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';

import { Subject } from 'rxjs';

import { MenuPositionX, MenuPositionY } from './types/menu-positions';

@Component({
  selector: 'iq-menu',
  exportAs: 'iqMenu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class IQMenuComponent {
  @ViewChild(TemplateRef) templateRef!: TemplateRef<any>;

  close$: Subject<boolean> = new Subject();

  private xPosition: MenuPositionX = 'after';
  private yPosition: MenuPositionY = 'below';
  private menuWidth = 212;
  private menuHeight = 0;

  @Input() panelClass!: string | string[];
  @Input() backdropClass!: string | string[];

  @Input()
  set positionX(value: MenuPositionX) {
    this.xPosition = value;
  }

  get positionX(): MenuPositionX {
    return this.xPosition;
  }

  @Input()
  set positionY(value: MenuPositionY) {
    this.yPosition = value;
  }

  get positionY(): MenuPositionY {
    return this.yPosition;
  }

  @Input() set dropdownMenuWidth(value: number) {
    this.menuWidth = value;
  }

  get dropdownMenuWidth(): number {
    return this.menuWidth;
  }

  @Input() set dropdownMenuHeight(value: number) {
    this.menuHeight = value;
  }

  get dropdownMenuHeight(): number {
    return this.menuHeight;
  }

  @Input() offsetY!: number;
  @Input() offsetX!: number;

  @Output() closeMenu: EventEmitter<void> = new EventEmitter<void>();
}
