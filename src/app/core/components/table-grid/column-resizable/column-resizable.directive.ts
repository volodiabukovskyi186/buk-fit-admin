import { Directive, OnInit, Renderer2, Input, ElementRef, OnDestroy, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { fromEvent, Subscription } from 'rxjs';

@Directive({
  selector: '[HSColumnResizable]',
})
export class ColumnResizableDirective implements OnInit, OnDestroy {
  @Input('HSColumnResizable') resizable!: boolean;

  private readonly column: HTMLElement;
  private startWidthCurrent!: number;
  private columnNext!: HTMLElement;
  private startWidthNext!: number;
  private table!: HTMLElement;
  private pressed!: boolean;
  private startX!: number;

  private subscription: Subscription = new Subscription();

  constructor(
    private renderer: Renderer2,
    private el: ElementRef<HTMLTableHeaderCellElement>,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.column = this.el.nativeElement;
  }

  ngOnInit() {
    if (this.resizable) {
      const headerRow = this.renderer.parentNode(this.column);
      this.table = this.renderer.parentNode(headerRow);

      const resizeBar = this.renderer.createElement('span');
      this.renderer.addClass(resizeBar, 'hs-resize-bar');
      this.renderer.appendChild(this.column, resizeBar);

      this.onMouseDownSubscription(resizeBar);
      this.onMouseMoveSubscription(this.table);
      this.onMouseUpSubscription(this.document);

      setTimeout(() => {
        this.getNextCollumn();
      });
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private getNextCollumn(): void {
    Array.from(this.table.querySelectorAll('.hs-table-header-cell')).map((row: Element, index: number) => {
        if (row === this.column) {
          this.columnNext = this.table.querySelectorAll('.hs-table-header-cell')[index + 1] as HTMLElement;
        }
    });
  }

  private onMouseDownSubscription(target: HTMLElement): void {
    const stream$ = fromEvent<MouseEvent>(target, 'mousedown').subscribe(
      (event: MouseEvent) => {
        this.pressed = true;
        this.startX = event.pageX;
        this.startWidthCurrent = this.column.offsetWidth;
        this.startWidthNext = this.columnNext.offsetWidth;
      }
    );

    this.subscription.add(stream$);
  }

  private onMouseMoveSubscription(target: HTMLElement): void {
    const stream$ = fromEvent<MouseEvent>(target, 'mousemove').subscribe(
      (event: MouseEvent) => {
        if (this.pressed && event.buttons) {
          this.renderer.addClass(this.table, 'resizing');

          const widthCurrent = this.startWidthCurrent + (event.pageX - this.startX);
          const widthNext = this.startWidthNext - (event.pageX - this.startX);

          if (widthCurrent <= 30 || widthNext <= 30) {
            return;
          }

          this.renderer.setStyle(this.column, 'width', `${widthCurrent}px`);
          this.renderer.setStyle(this.columnNext, 'width', `${widthNext}px`);
        }
      }
    );

    this.subscription.add(stream$);
  }

  private onMouseUpSubscription(target: Document): void {
    const stream$ = fromEvent<MouseEvent>(target, 'mouseup').subscribe(() => {
      if (this.pressed) {
        this.pressed = false;
        this.renderer.removeClass(this.table, 'resizing');
      }
    });

    this.subscription.add(stream$);
  }
}
