import { Injectable } from '@angular/core';
import {PAYMENT_DATE_ENUM} from '../../enums/payment-date/payment-date.enum';

@Injectable({
  providedIn: 'root'
})
export class BKCheckPaymentDateService {

  constructor() { }

  checkPaymentDate(date): any {
    if (date?.seconds) {

      const payDate = new Date(date.seconds * 1000);

      const dueDate = new Date(payDate);
      dueDate.setMonth(dueDate.getMonth());

      const today = new Date();

      const warningDate = new Date(dueDate);
      warningDate.setDate(warningDate.getDate() - 2);

      if (today >= dueDate) {
        return PAYMENT_DATE_ENUM.OVERDUE
      } else if (today >= warningDate) {
        return PAYMENT_DATE_ENUM.WARNING
      } else {
        return PAYMENT_DATE_ENUM.ON_TIME
      }

    }

    return null
  }
}
