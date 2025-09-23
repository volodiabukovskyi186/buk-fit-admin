import {Component, ViewEncapsulation} from '@angular/core';
import {UserPaymentComponent} from '../../../users/pages/user-detail/components/user-payment/user-payment.component';
import {TableGridModule} from '../../../../../core/components/table-grid';

@Component({
  selector: 'bk-expiring-payment-detail',
  standalone: true,
  imports: [
    UserPaymentComponent,
  ],
  templateUrl: './expiring-payment-detail.component.html',
  styleUrl: './expiring-payment-detail.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class ExpiringPaymentDetailComponent {

}
