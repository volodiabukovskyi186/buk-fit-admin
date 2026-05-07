import { Directive, ElementRef, Input, OnChanges, Renderer2 } from '@angular/core';

interface Milestone {
  maxDays: number;
  label: string;
  cssClass: string;
}

const MILESTONES: Milestone[] = [
  { maxDays: 3,  label: '3 дні',   cssClass: 'bk-days-milestone-3' },
  { maxDays: 6,  label: '6 днів',  cssClass: 'bk-days-milestone-2' },
  { maxDays: 10, label: '10 днів', cssClass: 'bk-days-milestone-1' },
];

@Directive({ selector: '[bkDaysMilestone]' })
export class BkDaysMilestoneDirective implements OnChanges {
  @Input() bkDaysMilestone: number | undefined;

  private badge: HTMLElement | null = null;

  constructor(private el: ElementRef<HTMLElement>, private renderer: Renderer2) {}

  ngOnChanges(): void {
    this.clear();

    const days = this.bkDaysMilestone;
    if (days == null || days < 0) return;

    const milestone = MILESTONES.find(m => days <= m.maxDays);
    if (!milestone) return;

    this.renderer.addClass(this.el.nativeElement, milestone.cssClass);

    this.badge = this.renderer.createElement('span');
    this.renderer.addClass(this.badge, 'bk-days-milestone-badge');
    this.renderer.setProperty(this.badge, 'textContent', milestone.label);
    this.el.nativeElement.insertBefore(this.badge, this.el.nativeElement.firstChild);
  }

  private clear(): void {
    if (this.badge) {
      this.el.nativeElement.removeChild(this.badge);
      this.badge = null;
    }
    MILESTONES.forEach(m =>
      this.renderer.removeClass(this.el.nativeElement, m.cssClass)
    );
  }
}
