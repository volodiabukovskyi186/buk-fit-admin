import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostBinding,
  Inject, Input,
  OnDestroy,
  Optional,
  Output
} from '@angular/core';

import { Subscription } from 'rxjs';

import { HS_SELECT_PARENT_COMPONENT, HSSelectParentComponent } from '../select-parent.component';

@Component({
  selector: 'hs-select-option-all',
  templateUrl: './select-option-all.component.html',
  styleUrls: ['./select-option-all.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HSSelectOptionAllComponent implements AfterViewInit, OnDestroy {
  @Input()
  set compareWith(fn: (o1: any, o2: any) => boolean) {
    if (typeof fn !== 'function') {
      console.error('Incorrect compareWith function');
    }
    this._compareWith = fn;
  }

  @Output() onSelectionChange: EventEmitter<HSSelectOptionAllComponent> = new EventEmitter<HSSelectOptionAllComponent>();

  selected = false;
  optionsValue: any[] = [];

  private selectValue: any;
  private selectComponent: HSSelectParentComponent;
  private subscription: Subscription = new Subscription();
  private _compareWith = (o1: any[], o2: any[]) => [...o1].sort().join(',') === [...o2].sort().join(',');

  @HostBinding('class.selected')
  get selectedClass(): boolean {
    return this.selected;
  }

  constructor(
    @Optional() @Inject(HS_SELECT_PARENT_COMPONENT) select: HSSelectParentComponent,
    private cdr: ChangeDetectorRef
  ) {
    this.selectComponent = select;
  }

  ngAfterViewInit(): void {
    this.optionsValue = this.selectComponent.options.map(x => x.value);

    const streamOptionsChange$ = this.selectComponent.options.changes
      .subscribe(() => {
        this.optionsValue = this.selectComponent.options.map(x => x.value);
        this.updateState();
      });

    this.selectValue = this.selectComponent.ngControl?.control?.value || [];

    if (this.selectComponent.ngControl?.valueChanges) {
      const streamValueChange$ = this.selectComponent.ngControl.valueChanges
        .subscribe((res: any) => {
          this.selectValue = res;
          this.updateState();
        });

      this.subscription.add(streamValueChange$);
    }

    setTimeout(() => {
      this.updateState();
    });

    this.subscription.add(streamOptionsChange$);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onSelectAllClick(): void {
    this.onSelectionChange.emit(this);

    if (this.selected) {
      if (this.selectComponent.ngControl) {
        this.selectComponent.ngControl.control?.setValue([]);
      } else {
        this.selectComponent.value = [];
        this.selectValue = [];
        this.updateState();
      }

    } else {
      if (this.selectComponent.ngControl) {
        this.selectComponent.ngControl.control?.setValue(this.optionsValue);
      } else {
        this.selectComponent.value = [...this.optionsValue];
        this.selectValue = this.selectComponent.value;
        this.updateState();
      }
    }
  }

  private updateState(): void {
    this.selected = this._compareWith(this.selectValue, this.optionsValue);
    this.cdr.detectChanges();
  }
}
