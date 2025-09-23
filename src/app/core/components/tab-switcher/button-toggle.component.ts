import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  HostListener,
  Inject,
  Input,
  Optional,
  ViewEncapsulation
} from '@angular/core';

import {
  ButtonToggleGroupDirective,
  CS_BUTTON_TOGGLE_GROUP
} from './directives/button-toggle-group.directive';

@Component({
  selector: 'hs-tab-switcher',
  templateUrl: './button-toggle.component.html',
  styleUrls: ['./button-toggle.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonToggleComponent {

  private static buttonToggleId = 0;

  @Input() value: any;

  buttonToggleGroup: ButtonToggleGroupDirective;
  hideLine = false;
  previousActive = false;
  name = `hs-tab-switcher-${ButtonToggleComponent.buttonToggleId++}`;
  isHovered: boolean;

  @HostBinding('class.hs-tab-switcher-item-hovered')
  get hoveredButtonClass(): boolean {
    return this.isHovered;
  }

  @HostBinding('class.hs-tab-switcher-item-next-hovered')
  get nextHoveredButtonClass(): boolean {
    const previousToggleButton = this.getPreviousToggleButton(this.name);
    return previousToggleButton?.isHovered || false;
  }

  @HostBinding('class.hs-tab-switcher-item-previous-hovered')
  get previousHoveredButtonClass(): boolean {
    const nextToggleButton = this.getNextToggleButton(this.name);
    return nextToggleButton?.isHovered || false;
  }

  @HostBinding('class.hs-tab-switcher-item-next-active')
  get nextActiveButtonClass(): boolean {
    const previousToggleButton = this.getPreviousToggleButton(this.name);
    return previousToggleButton?.isItemActive || false;
  }

  @HostBinding('class.hs-tab-switcher-item-previous-active')
  get previousActiveButtonClass(): boolean {
    const nextToggleButton = this.getNextToggleButton(this.name);
    return nextToggleButton?.isItemActive || false;
  }

  @HostBinding('class.hs-tab-switcher-item-active')
  get toggleButtonActive(): boolean {
    return this.isItemActive;
  }

  @HostBinding('class.hs-tab-switcher-item-first')
  get firstButtonClass(): boolean {
    const currentButtonIndex = this.getCurrentToggleButtonIndex(this.name);
    return currentButtonIndex === 0;
  }

  @HostBinding('class.hs-tab-switcher-item-last')
  get lastButtonClass(): boolean {
    const currentButtonIndex = this.getCurrentToggleButtonIndex(this.name);
    const toggleButtonsLength = this.buttonToggleGroup?.toggleButtonsArray?.length || 0;

    return currentButtonIndex > 0 && currentButtonIndex === toggleButtonsLength - 1;
  }

  @HostBinding('class.hs-tab-switcher-item-multiple')
  get multipleButtonClass(): boolean {
    return this.buttonToggleGroup?.multiple || false;
  }

  @HostBinding('class.hs-tab-switcher-item-two-buttons')
  get twoButtonsClass(): boolean {
    return this.buttonToggleGroup.toggleButtonsArray.length === 2 || false;
  }

  @HostListener('mouseenter')
  onMouseEnterAction(): void {
    this.isHovered = true;
  }

  @HostListener('mouseleave')
  onMouseLeaveAction(): void {
    this.isHovered = false;
  }

  constructor(
    @Optional() @Inject(CS_BUTTON_TOGGLE_GROUP) toggleGroup: ButtonToggleGroupDirective
  ) {    
    this.buttonToggleGroup = toggleGroup;
  }

  get isItemActive(): boolean {
    return this.buttonToggleGroup && this.buttonToggleGroup.value && this.buttonToggleGroup.multiple
      ? this.buttonToggleGroup.value.indexOf(this.value) !== -1
      : this.buttonToggleGroup.value === this.value;
  }

  onButtonClick(): void {
    if (this.buttonToggleGroup.multiple || !this.isItemActive) {
      this.buttonToggleGroup.updateValueFromItem(this.value);
    }
  }

  private getNextToggleButton(currentToggleButtonName: string): ButtonToggleComponent | null {
    const currentButtonToggleIndex = this.getCurrentToggleButtonIndex(currentToggleButtonName);
    return this.buttonToggleGroup.toggleButtonsArray[currentButtonToggleIndex + 1];
  }

  private getPreviousToggleButton(currentToggleButtonName: string): ButtonToggleComponent | null {
    const currentButtonToggleIndex = this.getCurrentToggleButtonIndex(currentToggleButtonName);
    return this.buttonToggleGroup.toggleButtonsArray[currentButtonToggleIndex - 1];
  }

  private getCurrentToggleButtonIndex(currentToggleButtonName: string): number {
    return this.buttonToggleGroup.toggleButtonsArray.findIndex(button => button.name === currentToggleButtonName);
  }
}
