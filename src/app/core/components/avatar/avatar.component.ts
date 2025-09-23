import { ChangeDetectionStrategy, Component, ElementRef, HostBinding, Input } from '@angular/core';
import { OnInit, ViewChild, ViewEncapsulation } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

export enum HSAvatarSizes {
  x272 = 'x272',
  x128 = 'x128',
  x104 = 'x104',
  x72 = 'x72',
  x64 = 'x64',
  x56 = 'x56',
  x52 = 'x52',
  x48 = 'x48',
  x40 = 'x40',
  x36 = 'x36',
  x32 = 'x32',
  x28 = 'x28',
  x24 = 'x24',
  x20 = 'x20',
  x18 = 'x18'
}

@Component({
  selector: 'hs-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HSAvatarComponent implements OnInit {
  @ViewChild('image', {static: true}) public image?: ElementRef<HTMLImageElement>;

  @Input() src?: string;
  @Input() size: keyof typeof HSAvatarSizes = HSAvatarSizes.x24;
  @Input() borderColor!: string;
  @Input() borderWidth = 1
  @Input() isSquare = false;


  @Input()
  set name(inputName: string) {
    this._name = inputName;    
    // this.color = this.getRandomColor(this._name);
  }
  
  @Input()
  set background(inputColor: string) {
    if(inputColor) {
      this.color = inputColor;
    }
  }

  get name(): string {
    return this._name;
  }

  @HostBinding('class.hs-avatar-square')
  get checkIsAvatarSquare(): boolean {
    return this.isSquare;
  }

  loaded$ = new BehaviorSubject(false);
  color = '#2525251A';

  private avatarColors = [
    '#023FB1',
    '#01575F',
    '#03518A',
    '#8A2F01',
    '#8902A3',
    '#572EAB',
  ];

  private _name = '';

  ngOnInit(): void {
    this.loadImage();
  }

  onError(): void {
    this.loaded$.next(false);
  }

  loadImage(): void {
    if (this.image) {      
      this.checkLoaded(this.image.nativeElement);
    }
  }

  checkLoaded(img: HTMLImageElement): void {
    if (img.complete) {
      this.loaded$.next(true);
    } else {
      img.onload = () => {
        this.loaded$.next(true);
      };
    }
  }

  get classList(): string {
    return [this.sizeClass()].join(' ');
  }

  private sizeClass(): string {
    return `hs-avatar-${this.size ? this.size : HSAvatarSizes.x56}`;
  }

  public getRandomColor(name: string): string {
    const asciiCodeSum = this.calculateAsciiCode(name);
    return this.avatarColors[asciiCodeSum % this.avatarColors.length];
  }

  private calculateAsciiCode(value: string): number {
    if (!value) {
      return 0;
    }

    return value
      .split('')
      .map((letter) => letter.charCodeAt(0))
      .reduce((previous, current) => previous + current);
  }
}
