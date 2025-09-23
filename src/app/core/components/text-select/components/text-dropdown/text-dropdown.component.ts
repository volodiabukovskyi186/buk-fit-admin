import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { CdkPortal } from '@angular/cdk/portal';
import { ConnectedPosition, Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { OverlayPositionBuilder } from '@angular/cdk/overlay';
import { Subscription } from 'rxjs';

@Component({
  selector: 'hs-text-dropdown',
  styleUrls: ['./text-dropdown.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-template cdkPortal>
      <!-- InfinityScroll [scrollPercent]="90" (scrollEvent)="scrollEvent.emit($event)" -->
     <div class="hs-text-dropdown-container">
      <ng-content></ng-content>
     </div>
    </ng-template>
  `
})
export class HSDropdownComponent implements OnDestroy {
  @ViewChild(CdkPortal) contentTemplate!: CdkPortal;

  @Input() reference!: HTMLElement;
  @Input() minWidth!: number;
  @Input() maxHeight = 200;
  @Input() offsetX;

  @Output() openingChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() scrollEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

  overlayRef!: OverlayRef | null;
  showing = false;

  private subscription = new Subscription();

  @HostListener('window:resize')
  onWindowsResize(): void {
    this.updateOverlayWidth();
  }

  constructor( private overlay: Overlay ) { }

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
          offsetX: this.offsetX,
        },
        {
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'bottom',
         
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
