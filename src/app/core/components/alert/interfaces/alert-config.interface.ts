import { MatSnackBarConfig } from "@angular/material/snack-bar";

export interface AlertConfigInterface extends MatSnackBarConfig<AlertDataInterface>{}

export interface AlertDataInterface  {
  description: string;
 
  title?: string;
  type?: string;
  size?: string;
  icon?: string;
  buttons?: AlertButtonConfigInterface[];
}

export interface AlertButtonConfigInterface {
  iconAlign?: string;
  icon?: string;
  title: string;
  action?: any;
}
