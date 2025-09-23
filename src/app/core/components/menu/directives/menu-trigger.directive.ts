import { ChangeDetectorRef, Directive, ElementRef, HostListener } from '@angular/core';
import { Inject, Input, OnDestroy, ViewContainerRef } from '@angular/core';
import { HorizontalConnectionPos, Overlay, OverlayConfig } from '@angular/cdk/overlay';
import { OverlayRef, VerticalConnectionPos} from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';

import { merge, Observable, Subscription } from 'rxjs';

import { IQMenuComponent } from '../menu.component';

@Directive({
  selector: '[iqMenuTriggerFor]',
  exportAs: 'iqMenuTriggerFor'
})
export class IQMenuTriggerDirective implements OnDestroy {
  @Input('iqMenuTriggerFor')
  get menu() {
    return this._menu;
  }

  set menu(menu: IQMenuComponent) {
    if (menu === this._menu) {
      return;
    }

    this._menu = menu;
    this.closingActionsSubscription.unsubscribe();
  }

  @Input() idElementToBlur = '';
  @Input() isTriggerRightMouseButton = false;

  private _menu!: IQMenuComponent;
  private menuIsOpened = false;
  private overlayRef: OverlayRef | null = null;
  private portal!: TemplatePortal;
  private closingActionsSubscription = Subscription.EMPTY;

  private get elementToBlur(): HTMLElement | null {
    return this.idElementToBlur ? this.document.getElementById(this.idElementToBlur) : null;
  }

  @HostListener('click', ['$event'])
  private handleClick(): void {
    if (this.isTriggerRightMouseButton) return;

    this.openMenu();
  }

  @HostListener('contextmenu', ['$event'])
  private right(): void {
    if (!this.isTriggerRightMouseButton) return;

    this.openMenu();
  }

  constructor(
    private viewContainerRef: ViewContainerRef,
    private element: ElementRef<HTMLElement>,
    private cdr: ChangeDetectorRef,
    private overlay: Overlay,
    @Inject(DOCUMENT) private document: Document
  ) {
  }

  get menuOpened(): boolean {
    return this.menuIsOpened;
  }

  openMenu(): void {
    if (this.menuIsOpened) {
      return;
    }
    if (this.elementToBlur) {
      this.elementToBlur.classList.add('iq-blur');
    }

    const overlayRef = this.createOverlay();
    const overlayConfig = overlayRef.getConfig();
    overlayConfig.panelClass = this._menu.panelClass;
    overlayConfig.backdropClass = this._menu.backdropClass;

    this.setPosition(overlayConfig.positionStrategy as any);

    overlayRef.attach(this.getPortal());

    this.closingActionsSubscription = this.menuClosingActions(overlayRef).subscribe(
      () => this.closeMenu()
    );
    this.initMenu();
  }

  closeMenu(): void {
    if (!this.overlayRef || !this.menuIsOpened) {
      return;
    }

    this.closingActionsSubscription.unsubscribe();
    this.overlayRef.detach();

    this.menuIsOpened = false;

    if (this.elementToBlur) {
      this.elementToBlur.classList.remove('iq-blur');
    }

    this._menu?.closeMenu?.emit();
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
    this.closingActionsSubscription.unsubscribe();
  }

  private createOverlay(): OverlayRef {
    if (!this.overlayRef) {
      const config = this.getOverlayConfig();
      if (this._menu.dropdownMenuWidth) {
        config.width = this._menu.dropdownMenuWidth;
        config.minWidth = this._menu.dropdownMenuWidth;
      }
      if (this._menu.dropdownMenuHeight) {
        config.height = this._menu.dropdownMenuHeight;
      }



      this.overlayRef = this.overlay.create(config);
    }

    return this.overlayRef;
  }

  private getOverlayConfig(): OverlayConfig {
    return new OverlayConfig({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(this.element.nativeElement),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop'
    });
  }

  private getPortal(): TemplatePortal {
    if (!this.portal || this.portal.templateRef !== this._menu.templateRef) {
      this.portal = new TemplatePortal(
        this._menu.templateRef,
        this.viewContainerRef
      );
    }
    return this.portal;
  }

  private setPosition(positionStrategy: any): void {
    let originX: HorizontalConnectionPos;
    let originFallbackX: HorizontalConnectionPos;

    let offsetY = this._menu.offsetY ? -this._menu.offsetY : 0;
    let offsetX = this._menu.offsetX ? this._menu.offsetX : 0;

    switch (this._menu.positionX) {
      case 'before':
        originX = 'end';
        originFallbackX = 'start';
        offsetX = -offsetX;
        break;
      case 'after':
        originX = 'start';
        originFallbackX = 'end';
        break;
      case 'center':
        originX = 'center';
        originFallbackX = 'end';
        break;
    }

    const [overlayY, overlayFallbackY]: VerticalConnectionPos[] =
      this._menu.positionY === 'above' ? ['bottom', 'top'] : ['top', 'bottom'];

    let [originY, originFallbackY] = [overlayY, overlayFallbackY];
    const [overlayX, overlayFallbackX] = [originX, originFallbackX];

    if (this._menu.positionY === 'below') {
      offsetY = -offsetY;
    }
    originY = overlayY === 'top' ? 'bottom' : 'top';
    originFallbackY = overlayFallbackY === 'top' ? 'bottom' : 'top';


    positionStrategy.withPositions([
      { originX, originY, overlayX, overlayY, offsetY, offsetX },
      { originX: originFallbackX, originY, overlayX: overlayFallbackX, overlayY, offsetY, offsetX: -offsetX },
      {
        originX,
        originY: originFallbackY,
        overlayX,
        overlayY: overlayFallbackY,
        offsetY: -offsetY,
        offsetX
      },
      {
        originX: originFallbackX,
        originY: originFallbackY,
        overlayX: overlayFallbackX,
        overlayY: overlayFallbackY,
        offsetY: -offsetY,
        offsetX: -offsetX
      }
    ]);
  }

  private initMenu(): void {
    this.menuIsOpened = true;
  }

  private menuClosingActions(overlayRef: OverlayRef): Observable<any> {
    const backdrop = overlayRef.backdropClick();
    const detachments = overlayRef.detachments();
    const menuClose = this._menu.close$;

    return merge(backdrop, detachments, menuClose);
  }
}
