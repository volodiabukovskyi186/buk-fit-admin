import { Directive, HostBinding, HostListener, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

export enum ButtonColorEnum {
  primary = 'primary',
  accend = 'accend',
  success = 'success',
  error = 'error',
  warning = 'warning'
}

export enum ButtonModesEnum {
  default = 'default',

  outlined = 'outlined',
  white = 'white',
  text = 'text',
  textPrimary = 'text-primary',
  outlinedPrimary = 'outlined-primary',
  accendPrimary = 'outlined-accend',
}

export enum ButtonTypesEnum {
  button = 'button',
  submit = 'submit',
  reset = 'reset'
}

export enum ButtonIconAlignTypesEnum {
  left = 'left',
  right = 'right',
}

export enum ButtonSizeEnum {
  large = 'large',
  medium = 'medium',
}

@Directive()
export class HSButtonBase {
  @Input() color: keyof typeof ButtonColorEnum = ButtonColorEnum.primary;
  @Input() mode: keyof typeof ButtonModesEnum = ButtonModesEnum.default;
  @Input() type: keyof typeof ButtonTypesEnum = ButtonTypesEnum.button;
  @Input() set size(value: any) {
    this.btnSize = value;
    this.checkIfMobileSize();
  };
  @Input() iconAlign: keyof typeof ButtonIconAlignTypesEnum = ButtonIconAlignTypesEnum.left;
  @Input() iconClass = '';
  @Input() text = '';
  @Input() isDisabled = false;
  @Input() isActive = false;
  @Input() class = '';
  @Input() width = '';
  @Input() isMobileVersion = false;
  @Input() iconSize = 18;

  @HostBinding('class')
  get buttonBaseClass(): string {
    return this.joinedClassList;
  }

  @HostBinding('style')
  get myStyle(): SafeStyle {
    if (this.width) {
      return this.sanitizer.bypassSecurityTrustStyle(`width: ${this.width}`);
    }

    return '';
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    // this.checkIfMobileSize();
  }

  btnSize = ButtonSizeEnum.medium;

  constructor(protected sanitizer: DomSanitizer) {
    this.checkIfMobileSize();
  }

  checkIfMobileSize(): void {
    if (window.innerWidth <= 1200) {
      this.btnSize = ButtonSizeEnum.medium;
    } else {
      this.btnSize = ButtonSizeEnum.large;
    }
  }

  get joinedClassList(): string {
    return [
      this.buttonTypeClass,
      this.iconAlignClass,
      this.disabledClass,
      this.activeClass,
      this.iconWithoutMarginClass,
      this.mobileVersion,
      this.colorClass,
      this.sizeClass,
      this.class
    ]
      .filter(Boolean)
      .join(' ');
  }

  private get mobileVersion(): string {
    return this.isMobileVersion ? 'hs-button-mobile-version' : '';
  }

  private get buttonTypeClass(): string {
    return `hs-button hs-button-${this.mode ? this.mode : ButtonModesEnum.default}`;
  }

  private get iconAlignClass(): string {
    return `hs-button-icon-${this.iconAlign ? this.iconAlign : ButtonIconAlignTypesEnum.left}`;
  }

  private get disabledClass(): string {
    return this.isDisabled ? 'hs-button-disabled' : '';
  }

  private get sizeClass(): string {
    return `hs-button-size-${this.btnSize ? this.btnSize : ButtonSizeEnum.large}`;
  }

  private get activeClass(): string {
    return this.isActive ? 'hs-button-active' : '';
  }

  private get iconWithoutMarginClass(): string {
    return this.iconClass && !this.text ? 'hs-button-icon-no-text' : '';
  }

  private get colorClass(): string {
    return `hs-button-color-${this.color}`;
  }
}
