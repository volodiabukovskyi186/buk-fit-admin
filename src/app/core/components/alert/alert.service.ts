import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { Injectable } from '@angular/core';

import { AlertButtonConfigInterface, AlertConfigInterface } from './interfaces/alert-config.interface';
import { AlertConfigModel } from './models/alert-config.model';
import { HSAlertComponent } from './alert.component';

import { ALERT_MODES_ENUM } from './enums/alert-modes.enum';
import { ALERT_SIZES_ENUM } from './enums/alert-sizes.enum';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(
    private snackBar: MatSnackBar
  ) {
  }

  open(config: AlertConfigInterface): MatSnackBarRef<HSAlertComponent> {
   return this.snackBar.openFromComponent(HSAlertComponent, new AlertConfigModel(config));
  }

  openDefaultError(title: string, description: string, buttons?: AlertButtonConfigInterface []): MatSnackBarRef<HSAlertComponent> {
    return this.open({data:{title, description, buttons, size: ALERT_SIZES_ENUM.DEFAULT, type: ALERT_MODES_ENUM.ERROR}});
  }

  openLargeError(description: string,  buttons?: AlertButtonConfigInterface []): MatSnackBarRef<HSAlertComponent> {
    return this.open({data:{description, buttons, size: ALERT_SIZES_ENUM.LARGE, type: ALERT_MODES_ENUM.ERROR}});
  }
  
  openDefaultWarning(title: string, description: string, buttons?: AlertButtonConfigInterface []): MatSnackBarRef<HSAlertComponent> {
    return this.open({data:{title, description, buttons, size: ALERT_SIZES_ENUM.DEFAULT, type: ALERT_MODES_ENUM.WARNING}});
  }

  openLargeWarning(description: string,  buttons?: AlertButtonConfigInterface []): MatSnackBarRef<HSAlertComponent> {
    return this.open({data:{description, buttons, size: ALERT_SIZES_ENUM.LARGE, type: ALERT_MODES_ENUM.WARNING}});
  }

  openDefaultSuccess(title: string, description: string, buttons?: AlertButtonConfigInterface []): MatSnackBarRef<HSAlertComponent> {
    return this.open({data:{title, description, buttons, size: ALERT_SIZES_ENUM.DEFAULT, type: ALERT_MODES_ENUM.SUCCESS}});
  }

  openLargeSuccess(description: string,  buttons?: AlertButtonConfigInterface []): MatSnackBarRef<HSAlertComponent> {
    return this.open({data:{description, buttons, size: ALERT_SIZES_ENUM.LARGE, type: ALERT_MODES_ENUM.SUCCESS}});
  }

  openDefaultInfo(title: string, description: string, buttons?: AlertButtonConfigInterface []): MatSnackBarRef<HSAlertComponent> {
    return this.open({data:{title, description, buttons, size: ALERT_SIZES_ENUM.DEFAULT, type: ALERT_MODES_ENUM.INFO}});
  }

  openLargeInfo(description: string,  buttons?: AlertButtonConfigInterface []): MatSnackBarRef<HSAlertComponent> {
    return this.open({data:{description, buttons, size: ALERT_SIZES_ENUM.LARGE, type: ALERT_MODES_ENUM.INFO}});
  }
}