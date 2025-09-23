import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostBinding,
  Input, Renderer2,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { TOOLTIP_POSITION_ENUM } from './enums/tooltip-position.enum';

@Component({
  selector: 'cs-tooltip-ui',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TooltipComponent {
  @Input() text : string | number = '';
  @Input() set maxWidth(maxW: number) {
    if (maxW) {
      this._el.nativeElement.style.maxWidth = maxW + 'px';
    }
  }
  @Input() trianglePosition: keyof typeof TOOLTIP_POSITION_ENUM = 'top';

  @ViewChild('triangle') triangle: ElementRef;

  @HostBinding('class')
  get tooltipClass(): string {
    return `cs-tooltip cs-tooltip-triangle-${this.trianglePosition}`
  }

  constructor(public _el: ElementRef, private renderer: Renderer2) {}

  setTriangleHorizontalAlignment(margin: number): void {
    this.renderer.setStyle(this.triangle.nativeElement, 'left', margin + 'px');
    this.renderer.setStyle(this.triangle.nativeElement, 'visibility', 'visible');
  }

  setTriangleVerticalAlignment(margin: number): void {
    this.renderer.setStyle(this.triangle.nativeElement, 'top', margin + 'px');
    this.renderer.setStyle(this.triangle.nativeElement, 'visibility', 'visible');
  }
}
