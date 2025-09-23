import { ConnectedPosition, FlexibleConnectedPositionStrategy, Overlay, OverlayPositionBuilder, OverlayRef } from '@angular/cdk/overlay';
import { ComponentRef, Directive, ElementRef, HostListener} from '@angular/core';
import { Input, OnDestroy } from '@angular/core';

import { TooltipComponent } from './tooltip.component';
import { ComponentPortal } from '@angular/cdk/portal';
// import {
//   ConnectedPosition,
//   FlexibleConnectedPositionStrategy
// } from '@angular/cdk/overlay/position/flexible-connected-position-strategy';
import { TOOLTIP_POSITION_ENUM } from './enums/tooltip-position.enum';

@Directive({ selector: '[hsTooltip]' })
export class TooltipDirective implements OnDestroy {
  @Input('hsTooltip') text: string | number | undefined = '';
  @Input() set hsTooltipList(list: any[]) {
    if (list.length) {
      this.text = this.preapreListText(list);
    }
  }
  @Input() hsTooltipField: string;
  @Input() tooltipMaxWidth: number;
  @Input() set position(position: keyof typeof TOOLTIP_POSITION_ENUM) {
    this._position = TOOLTIP_POSITION_ENUM[position]
  };
  @Input() horizontalScrollClass: string;
  @Input() isTooltipDisabled: string;


  overlayRef: OverlayRef;
  triangle: HTMLElement;
  positionStrategy: FlexibleConnectedPositionStrategy;
  positions: ConnectedPosition = {
    offsetX: 0,
    offsetY: -10,
    originX: 'center',
    originY: 'top',
    overlayX: 'center',
    overlayY: 'bottom'
  };

  private _position: TOOLTIP_POSITION_ENUM;

  constructor(
    protected overlay: Overlay,
    protected overlayPositionBuilder: OverlayPositionBuilder,
    protected elementRef: ElementRef
  ) { 
  }

  private preapreListText(list: any): any {
    let fullText = '';
        
    list.forEach((elem: any, index: number) => {
      if(elem?.[this.hsTooltipField]) {
        fullText += `${elem?.[this.hsTooltipField]}${index !== list.length -1?', ':'.'}`;
      }
    });
    
    if (fullText !== '') {
      setTimeout(() => this.text = fullText)
    }
  }

  @HostListener('click') onClick() {
    this.hide();
  }

  @HostListener('mouseenter')
  show(): void {
   
    
    if (!this.text) {
      return
    }

    if (this.isTooltipDisabled) {
      return;
    }

    if (this.horizontalScrollClass) {
      const isScroll = this.isBlockHorizontalScroll();
      if (!isScroll) {
        return;
      }
    }

    this.setPosition(this._position);
    this.positionStrategy = this.overlayPositionBuilder
      .flexibleConnectedTo(this.elementRef)
      .withPositions([this.positions]);
    this.overlayRef = this.overlay.create({
      positionStrategy: this.positionStrategy
    });
    const tooltipRef: ComponentRef<TooltipComponent> = this.overlayRef.attach(
      new ComponentPortal(TooltipComponent)
    );
    
    tooltipRef.instance.text = this.text;
    tooltipRef.instance.trianglePosition = this._position;

    this.setTrianglePosition(tooltipRef);

    if (this.tooltipMaxWidth) {
      tooltipRef.instance.maxWidth = this.tooltipMaxWidth;
    }

  }

  @HostListener('mouseleave')
  hide(): void {
    if (!this.overlayRef) {
      return;
    }

    this.overlayRef.detach();
  }

  setPosition(position: TOOLTIP_POSITION_ENUM): void {
    switch (position) {
      case TOOLTIP_POSITION_ENUM.top:
        this.positions.originX = 'center';
        this.positions.originY = 'top';
        this.positions.overlayX = 'center';
        this.positions.overlayY = 'bottom';
        this.positions.offsetY = -10;
        this.positions.offsetX = 0;
        break;
      case TOOLTIP_POSITION_ENUM.bottom:
        this.positions.originX = 'center';
        this.positions.originY = 'bottom';
        this.positions.overlayX = 'center';
        this.positions.overlayY = 'top';
        this.positions.offsetY = 10;
        this.positions.offsetX = 0;

        break;
      case TOOLTIP_POSITION_ENUM.right:
        this.positions.originX = 'end';
        this.positions.originY = 'center';
        this.positions.overlayX = 'start';
        this.positions.overlayY = 'center';
        this.positions.offsetX = 10;
        this.positions.offsetY = 0;

        break;
      case TOOLTIP_POSITION_ENUM.left:
        this.positions.originX = 'start';
        this.positions.originY = 'center';
        this.positions.overlayX = 'end';
        this.positions.overlayY = 'center';
        this.positions.offsetX = -10;
        this.positions.offsetY = 0;
        break;
    }
  }

  ngOnDestroy(): void {
    this.hide();
  }

  private isBlockHorizontalScroll(): boolean {
    let classNameElement = this.elementRef.nativeElement.getElementsByClassName(this.horizontalScrollClass)[0];

    if (!classNameElement) {
      classNameElement = this.elementRef.nativeElement;
    }

    if (classNameElement.offsetWidth < classNameElement.scrollWidth) {
      return true;
    }

    return false;
  }

  private setTrianglePosition( tooltipRef: ComponentRef<TooltipComponent>): void {

    setTimeout(() => {
      const tooltipRect = tooltipRef.instance._el.nativeElement.getBoundingClientRect();
      const hostRect =  this.elementRef.nativeElement.getBoundingClientRect();

      switch (this._position) {
        case TOOLTIP_POSITION_ENUM.top:
        case TOOLTIP_POSITION_ENUM.bottom: {
          if (tooltipRect.width > hostRect.width) {
            const triangleLeft = (Math.abs(tooltipRect.left - hostRect.left) + hostRect.width / 2) - 8;
            tooltipRef.instance.setTriangleHorizontalAlignment(triangleLeft)
          } else {
            const triangleLeft = tooltipRect.width / 2 - 8;
            tooltipRef.instance.setTriangleHorizontalAlignment(triangleLeft)
          }
          break
        }
        case TOOLTIP_POSITION_ENUM.left:
        case TOOLTIP_POSITION_ENUM.right: {
          if (tooltipRect.height > hostRect.height) {
            const triangleTop = (Math.abs(tooltipRect.top - hostRect.top) + hostRect.height / 2) - 4;
            tooltipRef.instance.setTriangleVerticalAlignment(triangleTop);
          }
        }
      }

    })

  }
}

