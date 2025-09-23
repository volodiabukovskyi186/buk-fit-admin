import { Directive, HostBinding, Input } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

export enum IconButtonModesEnum {
  light = 'light',
  dark = 'dark',
  text = 'text',
  primary = 'primary',
}

export enum IconButtonTypesEnum {
  button = 'button',
  submit = 'submit',
  reset = 'reset'
}

@Directive()
export class HSIconButtonBase {
  @Input() mode: keyof typeof IconButtonModesEnum = IconButtonModesEnum.text;
  @Input() type: keyof typeof IconButtonTypesEnum = IconButtonTypesEnum.button; 
  @Input() isDisabled = false;
  @Input() isActive = false;

  @HostBinding('class')
  get iconButtonBaseClass(): string {
    return this.joinedClassList;
  }

  @HostBinding('style')
  get myStyle(): SafeStyle {
    return '';
  }

  constructor(protected sanitizer: DomSanitizer) {
  }

  get joinedClassList(): string {
    return [
      this.iconButtonTypeClass,
      this.disabledClass,
      this.activeClass,
    ]
      .filter(Boolean)
      .join(' ');
  }

  private get iconButtonTypeClass(): string {
    return `hs-icon-button hs-icon-button-${this.mode ? this.mode : IconButtonModesEnum.light}`;
  }

  private get disabledClass(): string {
    return this.isDisabled ? 'hs-icon-button-disabled' : '';
  }

  private get activeClass(): string {
    return this.isActive ? 'hs-icon-button-active' : '';
  }

}
