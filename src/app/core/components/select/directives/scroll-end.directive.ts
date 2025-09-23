import { Directive, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[hsScrollEnd]'
})
export class HSScrollEndDirective {
  @Output() scrolled = new EventEmitter<void>(); // Подія, що еммітиться при досягненні кінця списку

  private lastScrollTop = 0; // Запам'ятовуємо останню позицію скролу
  private triggered = false; // Флаг, який запобігає повторним викликам

  constructor(private el: ElementRef) {}

  @HostListener('scroll', ['$event'])
  onScroll(event: any): void {
    const target = event.target;
    const position = target.scrollTop + target.clientHeight;
    const height = target.scrollHeight;
    const isScrollingDown = target.scrollTop > this.lastScrollTop;

    // Якщо користувач доскролив до 90%, скролить вниз і ще не викликав подію
    if (isScrollingDown && position >= height * 0.9 && !this.triggered) {
      this.triggered = true; // Встановлюємо флаг, щоб уникнути повторних викликів
      this.scrolled.emit();
    }

    // Оновлюємо останню позицію скролу
    this.lastScrollTop = target.scrollTop;
  }
}
