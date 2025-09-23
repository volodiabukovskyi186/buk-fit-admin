import { Component, HostBinding, Input, ViewEncapsulation } from "@angular/core";

import { ButtonColorEnum } from "../../button-base.component";

@Component({
  selector: "hs-text-button",
  templateUrl: "./text-button.component.html",
  styleUrls: ["./text-button.component.scss"],
  encapsulation: ViewEncapsulation.None
})
export class HSTextButtonComponent {
  @Input() color: keyof typeof ButtonColorEnum = ButtonColorEnum.primary;
  @Input() class = '';
  @Input() isDisabled = false;


  @HostBinding('class')
  get textButtonClass(): string {
    return this.joinedClassList;
  }

  get joinedClassList(): string {
    return [
      this.disabledClass,
      this.colorClass,
      this.class
    ]
      .filter(Boolean)
      .join(' ');
  }

  private get disabledClass(): string {
    return this.isDisabled ? 'hs-text-button-disabled' : '';
  }

  private get colorClass(): string {
    return `hs-text-button-color-${this.color}`;
  }
}
