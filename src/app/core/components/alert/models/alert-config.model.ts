import { AlertConfigInterface } from '../interfaces/alert-config.interface';
import { AlertConfigClass } from './../alert-config.class';

import { ALERT_MODES_ENUM } from '../enums/alert-modes.enum';
import { ALERT_SIZES_ENUM } from '../enums/alert-sizes.enum';

export class AlertConfigModel extends AlertConfigClass {

  constructor(state: AlertConfigInterface)  {
    super();

    this.announcementMessage = state.announcementMessage;
    this.viewContainerRef = state.viewContainerRef;
    this.politeness = state.politeness;
    this.panelClass = this.setContainerSizeClass(state.data?.size)
    this.direction = state.direction;
    this.duration = state.duration;

    this.data = {
      icon: state.data?.icon ?? this.setAlertIcon(state.data?.type),
      type: state.data?.type ?? ALERT_MODES_ENUM.ERROR,
      size: state.data?.size ?? ALERT_SIZES_ENUM.LARGE,
      description: state.data?.description ?? '',
      title: state.data?.title ?? '',
      buttons: state.data?.buttons ?? []
    };
    
    this.horizontalPosition = state.horizontalPosition ?? 'right';
    this.verticalPosition =  state.verticalPosition ?? 'top';

  }

  private setContainerSizeClass(size?: string): string {
    return size === ALERT_SIZES_ENUM.LARGE ? 'hs-alert-large-container': 'hs-alert-default-container';
  }

  private setAlertIcon(type?: string): string {
    switch (type) {
      case  ALERT_MODES_ENUM.WARNING:
      case  ALERT_MODES_ENUM.ERROR:
        return 'hs-icon-warning';

      case  ALERT_MODES_ENUM.INFO:
        return 'hs-icon-info';

      case  ALERT_MODES_ENUM.SUCCESS:
        return 'hs-icon-check-circle';

    }

    return 'hs-icon-info'
  }

}
