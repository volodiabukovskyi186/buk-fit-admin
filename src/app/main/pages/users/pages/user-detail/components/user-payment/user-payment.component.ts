import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {HSFormFieldModule} from '../../../../../../../core/components/form-field';
import {HSSelectModule} from '../../../../../../../core/components/select/select.module';
import {IQCheckboxModule} from '../../../../../../../core/components/checkbox';
import {HSButtonModule} from '../../../../../../../core/components/button';
import {HSIconButtonModule} from '../../../../../../../core/components/icon-button';
import {HSInputModule} from '../../../../../../../core/components/input';
import {ButtonToggleModule} from '../../../../../../../core/components/button-toggle/button-toggle.module';
import {NgIf} from '@angular/common';
import {UserPaymentTemplateComponent} from './features/user-payment-template/user-payment-template.component';
import {UserPaymentsComponent} from './features/user-payments/user-payments.component';

export enum USER_PAYMENT_TAB_ENUM {
  PAYMENTS = 'PAYMENTS',
  PAYMENT_TEMPLATE = 'PAYMENT_TEMPLATE',

}

@Component({
  selector: 'bk-user-payment',
  standalone: true,
  templateUrl: './user-payment.component.html',
  styleUrls: ['./user-payment.component.scss'],
  imports: [
    HSFormFieldModule,
    HSSelectModule,
    IQCheckboxModule,
    HSButtonModule,
    ReactiveFormsModule,
    HSIconButtonModule,
    HSInputModule,
    ButtonToggleModule,
    NgIf,
    UserPaymentTemplateComponent,
    UserPaymentsComponent,
  ],
  encapsulation: ViewEncapsulation.None
})
export class UserPaymentComponent implements OnInit {
  protected readonly userPaymentTabEmun = USER_PAYMENT_TAB_ENUM;
  selectedView = USER_PAYMENT_TAB_ENUM.PAYMENTS

  ngOnInit(): void {

  }

  setTabView(data: any): void {

    this.selectedView = data;
  }


}
