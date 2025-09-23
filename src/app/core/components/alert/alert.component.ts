import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { AfterViewInit, Component, Inject, OnDestroy, ViewEncapsulation } from '@angular/core';
import { HostBinding } from '@angular/core';

import { AlertDataInterface } from './interfaces/alert-config.interface';

import { ALERT_MODES_ENUM } from './enums/alert-modes.enum';
import { ALERT_SIZES_ENUM } from './enums/alert-sizes.enum';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'hs-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HSAlertComponent implements AfterViewInit, OnDestroy {

  alertModesEnum = ALERT_MODES_ENUM;
  alertSizeEnum = ALERT_SIZES_ENUM;

  private subscription: Subscription = new Subscription();

  constructor(
    public snackBarRef: MatSnackBarRef<HSAlertComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public config: AlertDataInterface
  ) {
  }

  @HostBinding('class')
  get buttonBaseClass(): string {
    return this.joinedClassList;
  }

  get joinedClassList(): string {
    return [
      this.alertTypeClass,
    ]
      .filter(Boolean)
      .join(' ');
  }

  ngAfterViewInit(): void {
    this.closeAlert();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private get alertTypeClass(): string {
    return `hs-alert-type-${this.config.type ? this.config.type : ALERT_MODES_ENUM.ERROR}`;
  }

  private closeAlert(): void {
    // const stream$ = timer(2000).subscribe(() => this.snackBarRef.dismiss());

    // this.subscription.add(stream$);
  }
 
}
