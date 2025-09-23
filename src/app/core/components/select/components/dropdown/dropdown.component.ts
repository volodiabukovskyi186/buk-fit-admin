import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  Output,
  ViewChild
} from '@angular/core';
import { CdkPortal } from '@angular/cdk/portal';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';

import { Subscription } from 'rxjs';

@Component({
  selector: 'hs-dropdown',
  styleUrls: ['./dropdown.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-template cdkPortal>

     <div class="hs-dropdown-container" style="position: relative;" hsScrollEnd (scrolled)="scrollEvent.emit()" (mousemove)="onMouseMove($event)">
      <ng-content></ng-content>
     </div>
    </ng-template>

  `
})
export class HSDropdownComponent implements OnDestroy {
  @ViewChild(CdkPortal) contentTemplate!: CdkPortal;

  @Input() reference!: HTMLElement;
  @Input() minWidth!: number;
  @Input() maxWidth!: number;
  @Input() maxHeight = 200;
  @Input() offsetX = 0;

  @Output() openingChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() scrollEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() moveMoveEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

  overlayRef!: OverlayRef | null;
  showing = false;

  get element(): any {
    return this.el;
  }

  private subscription = new Subscription();

  @HostListener('window:resize')
  onWindowsResize(): void {
    this.updateOverlayWidth();
  }

  constructor(
    private overlay: Overlay,
    private el: ElementRef,
  ) { }

  onMouseMove(event): void {
    this.moveMoveEvent.emit(event);
  }
  test(): void{
    console.log(12312313123123123)
  }

  show(): void {
    if (this.overlayRef) {
      return;
    }

    this.initOverlay();
  }

  hide(): void {
    this.destroyOverlay();

    this.showing = false;
    this.openingChange.emit(this.showing);
  }

  updateOverlayWidth(): void {
    if (!this.overlayRef) {
      return;
    }

    if (this.minWidth) {
      this.overlayRef.updateSize({ minWidth: this.minWidth });
    }

    if (this.maxWidth) {
      this.overlayRef.updateSize({ maxWidth: this.maxWidth });
    }

    const refRect = this.reference.getBoundingClientRect();
    this.overlayRef.updateSize({ width: refRect.width });
  }

  getOverlayConfig(): OverlayConfig {
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.reference)
      .withPush(false)
      .withPositions([
        {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top',
          // offsetY: -200,
          offsetX: this.offsetX
        },
        {
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'bottom',
          offsetX: this.offsetX
        }
      ]);

    const scrollStrategy = this.overlay.scrollStrategies.reposition();

    return new OverlayConfig({
      positionStrategy: positionStrategy,
      scrollStrategy: scrollStrategy,
      hasBackdrop: true,
      maxHeight: this.maxHeight ? this.maxHeight : '',
      backdropClass: 'cdk-overlay-transparent-backdrop'
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.destroyOverlay();
  }

  private initOverlay(): void {
    this.overlayRef = this.overlay.create(this.getOverlayConfig());
    this.overlayRef.attach(this.contentTemplate);
    this.overlayBackdropSubscription(this.overlayRef);
    this.updateOverlayWidth();

    this.showing = true;
    this.openingChange.emit(this.showing);
  }

  private overlayBackdropSubscription(overlayRef: OverlayRef): void {
    const backdropStream$ = overlayRef.backdropClick().subscribe(() => {
      this.hide();
    });

    this.subscription.add(backdropStream$);
  }

  private destroyOverlay(): void {
    if (this.overlayRef) {
      this.overlayRef.detach();
      this.overlayRef = null;
    }
  }
}
