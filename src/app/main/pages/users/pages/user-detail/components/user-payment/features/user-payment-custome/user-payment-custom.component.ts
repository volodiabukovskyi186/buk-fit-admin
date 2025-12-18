import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {HSButtonModule} from "../../../../../../../../../core/components/button";
import {HSFormFieldModule} from "../../../../../../../../../core/components/form-field";
import {HSIconButtonModule} from "../../../../../../../../../core/components/icon-button";
import {HSInputModule} from "../../../../../../../../../core/components/input";
import {HSSelectModule} from "../../../../../../../../../core/components/select/select.module";
import {MatDatepicker, MatDatepickerInput, MatDatepickerModule} from "@angular/material/datepicker";
import {USER_PAYMENTS_TARIFF_ENUM} from '../../../../../../../../../core/enums/user-payments-tariff.enum';
import {ClientInterface} from '../../../../../../../../../core/interfaces/user.interface';
import {MatSnackBar} from '@angular/material/snack-bar';
import {collection, doc, Firestore, getDocs, query, setDoc, Timestamp, updateDoc, where} from '@angular/fire/firestore';
import {ActivatedRoute} from '@angular/router';
import moment from 'moment/moment';
import {MatMomentDateModule, MomentDateAdapter} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {CUSTOM_DATE_FORMATS} from '../../../../../../../../../app.config';
import {log} from '@angular-devkit/build-angular/src/builders/ssr-dev-server';
import {PAYMENT_STATUS_ENUM} from '../../../../../../../../../core/enums/payments-status.enum';

@Component({
  selector: 'bk-user-payment-custom',
  standalone: true,
  imports: [
    FormsModule,
    HSButtonModule,
    HSFormFieldModule,
    HSIconButtonModule,
    HSInputModule,
    HSSelectModule,
    MatDatepicker,
    MatDatepickerInput,
    ReactiveFormsModule,
    MatDatepickerModule, MatMomentDateModule,

  ],
  templateUrl: './user-payment-custom.component.html',
  styleUrl: './user-payment-custom.component.scss',
  providers: [
    {
      provide: MAT_DATE_FORMATS,
      useValue: CUSTOM_DATE_FORMATS,
    },
    {
      deps: [MAT_DATE_LOCALE],
      provide: DateAdapter,
      useClass: MomentDateAdapter,
    }
  ]
})
export class UserPaymentCustomComponent implements OnInit {
  readonly userPaymentsTariffEnum = USER_PAYMENTS_TARIFF_ENUM;
  formGroup: FormGroup;
  user: ClientInterface;
  id: string;

  constructor(
    private snackBar: MatSnackBar,
    private firestore: Firestore,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    this.initForm();
    this.loadData();
    this.setupFormSubscriptions();
  }

  private initForm(): void {
    this.formGroup = this.fb.group({
      tariff: [this.userPaymentsTariffEnum.BASIC, Validators.required],
      updatedAt: [null],
      comment: [`Оплата за тренування userId: ${this.id}`, Validators.required],
      price: [1920, Validators.required],
      fromDate: [moment(), Validators.required],
      toDate: [ moment().add(1, 'month'), Validators.required],
      payedDate: [moment()],
      id: [this.generateUUID()],
      userId: [this.id],
      status: [PAYMENT_STATUS_ENUM.PAYED],
      isPayed: [true]
    });
  }

  private setupFormSubscriptions(): void {
    this.formGroup.get('tariff')?.valueChanges.subscribe(tariff => {
      const cost = this.getTariffCost(tariff);
      this.formGroup.get('price')?.setValue(cost);
    });

    this.formGroup.get('fromDate')?.valueChanges.subscribe(fromDate => {
      if (fromDate) {
        const toDate = moment(fromDate).add(1, 'month');
        this.formGroup.get('toDate')?.setValue(toDate);
      }
    });
  }

  private getTariffCost(tariff: string): string {
    switch (tariff) {
      case USER_PAYMENTS_TARIFF_ENUM.BASIC:
        return '1920';
      case USER_PAYMENTS_TARIFF_ENUM.STANDARD:
        return '2880';
      case USER_PAYMENTS_TARIFF_ENUM.PREMIUM:
        return '4800';
      default:
        return '';
    }
  }

  private async loadData(): Promise<void> {
    await this.getUserById(this.id);
    await this.getPaymentsId(this.id);
  }

  async updateUser(): Promise<void> {
    if (!this.formGroup.valid) {
      this.showValidationError();
      this.formGroup.markAllAsTouched();
      return;
    }


    this.sendToClientPayment();

  }

  async sendToClientPayment(): Promise<void> {


    const payload = {
      ...this.preparePayload(),
      createdAt: Timestamp.now(),
    }
    console.log('payload----', payload)
    const clientsCollection = collection(this.firestore, 'users-payments');
    try {
      await setDoc(doc(clientsCollection), payload);
      this.snackBar.open('Оплату додано', 'Закрити', {duration: 2000});
      this.updateUserInfo();
    } catch (error) {
      console.error('❌ Помилка оновлення:', error);
    }
  }


  private preparePayload(): any {
    const rawValue = this.formGroup.getRawValue();

    return {
      ...rawValue,
      updatedAt: Timestamp.now(),
      fromDate: moment.isMoment(rawValue.fromDate)
        ? Timestamp.fromDate(rawValue.fromDate.toDate())
        : null,
      toDate: moment.isMoment(rawValue.toDate)
        ? Timestamp.fromDate(rawValue.toDate.toDate())
        : null,
      payedDate: Timestamp.now()
    };
  }



  private showValidationError(): void {
    if (!this.formGroup.get('tariff')?.valid) {
      this.snackBar.open('Поле тариф обовязкове до заповнення', 'Закрити', {duration: 3000});
    } else {
      this.snackBar.open('Форма не валідна виправіть помилки', 'Закрити', {duration: 3000});
    }
  }

  async getPaymentsId(userId: string): Promise<void> {
    // const clientsCollection = collection(this.firestore, 'payments-template');
    // const q = query(clientsCollection, where('userId', '==', userId));
    //
    // try {
    //   const snapshot = await getDocs(q);
    //   if (!snapshot.empty) {
    //     const data = snapshot.docs[0].data();
    //     const convertedData = this.convertDates(data);
    //     this.formGroup.setValue(convertedData);
    //   }
    // } catch (error) {
    //   console.error('❌ Помилка отримання даних:', error);
    // }
  }

  async updateUserInfo(): Promise<void> {
    const payload = {
      ...this.user,
      payDate: this.preparePayload().toDate,
    };

    const clientsCollection = collection(this.firestore, 'clients');
    const q = query(clientsCollection, where('id', '==', this.user.id));
    const snapshot = await getDocs(q);

    try {
      if (snapshot.empty) {
        const newDocRef = doc(clientsCollection);
        await setDoc(newDocRef, payload);
        this.snackBar.open('Дані успішно додано', 'Закрити', { duration: 2000 });
      } else {
        const docRef = snapshot.docs[0].ref;
        await updateDoc(docRef, payload);
      }
    } catch (error) {
      console.error('❌ Помилка оновлення:', error);
    }
  }

  async getUserById(id: string): Promise<void> {
    const clientsCollection = collection(this.firestore, 'clients');
    const q = query(clientsCollection, where('id', '==', id));

    try {
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        this.user = snapshot.docs[0].data() as ClientInterface;
      } else {
        console.warn('⚠️ Користувач не знайдений.');
      }
    } catch (error) {
      console.error('❌ Помилка отримання користувача:', error);
    }
  }

  private convertDates(data: any): any {
    return {
      ...data,
      fromDate: data.fromDate?.toDate() || null,
      toDate: data.toDate?.toDate() || null,
      updatedAt: data.updatedAt?.toDate() || null
    };
  }

  private generateUUID(): string {
    let dt = new Date().getTime();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  get isPayedControl(): AbstractControl {
    return this.formGroup.get('isPayed') as AbstractControl;
  }
}
