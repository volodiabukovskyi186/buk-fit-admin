import {Component, Inject, OnInit, OnDestroy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatMomentDateModule, MomentDateAdapter} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {collection, doc, Firestore, getDocs, query, Timestamp, updateDoc, where} from '@angular/fire/firestore';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Subscription} from 'rxjs';
import {skip} from 'rxjs/operators';
import moment from 'moment';
import {CUSTOM_DATE_FORMATS} from '../../../../app.config';
import {HSButtonModule} from '../../../../core/components/button';
import {HSFormFieldModule} from '../../../../core/components/form-field';
import {HSIconButtonModule} from '../../../../core/components/icon-button';
import {HSInputModule} from '../../../../core/components/input';
import {HSSelectModule} from '../../../../core/components/select/select.module';
import {USER_PAYMENTS_TARIFF_ENUM} from '../../../../core/enums/user-payments-tariff.enum';
import {PAYMENT_STATUS_ENUM} from '../../../../core/enums/payments-status.enum';

@Component({
  selector: 'bk-edit-payment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatMomentDateModule,
    HSButtonModule,
    HSFormFieldModule,
    HSIconButtonModule,
    HSInputModule,
    HSSelectModule,
  ],
  templateUrl: './edit-payment-dialog.component.html',
  styleUrl: './edit-payment-dialog.component.scss',
  providers: [
    {provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS},
    {deps: [MAT_DATE_LOCALE], provide: DateAdapter, useClass: MomentDateAdapter},
  ]
})
export class EditPaymentDialogComponent implements OnInit, OnDestroy {
  readonly tariffEnum = USER_PAYMENTS_TARIFF_ENUM;
  readonly statusEnum = PAYMENT_STATUS_ENUM;

  formGroup: FormGroup;
  isSaving = false;
  private subs = new Subscription();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {payment: any; docId: string},
    private dialogRef: MatDialogRef<EditPaymentDialogComponent>,
    private fb: FormBuilder,
    private firestore: Firestore,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    const p = this.data.payment;

    this.formGroup = this.fb.group({
      tariff:    [p.tariff || null, Validators.required],
      price:     [p.price || null, Validators.required],
      fromDate:  [p.fromDate?.toDate ? moment(p.fromDate.toDate()) : null, Validators.required],
      toDate:    [p.toDate?.toDate   ? moment(p.toDate.toDate())   : null, Validators.required],
      createdAt: [p.createdAt?.toDate ? moment(p.createdAt.toDate()) : null],
      isRenewal: [p.isRenewal ?? false],
      status:    [p.status || PAYMENT_STATUS_ENUM.PAYED],
      isPayed:   [p.isPayed ?? true],
      comment:   [p.comment || ''],
      coachId:   [p.coachId || null],
    });

    // skip(1) — ignore the first emission that hs-select triggers on init
    this.subs.add(
      this.formGroup.get('tariff')!.valueChanges.pipe(skip(1)).subscribe(tariff => {
        const prices: Record<string, string> = {
          [USER_PAYMENTS_TARIFF_ENUM.BASIC]:    '1920',
          [USER_PAYMENTS_TARIFF_ENUM.STANDARD]: '2880',
          [USER_PAYMENTS_TARIFF_ENUM.PREMIUM]:  '4800',
        };
        if (prices[tariff]) this.formGroup.get('price')?.setValue(prices[tariff]);
      })
    );

    this.subs.add(
      this.formGroup.get('fromDate')!.valueChanges.pipe(skip(1)).subscribe(fromDate => {
        if (fromDate) this.formGroup.get('toDate')?.setValue(moment(fromDate).add(1, 'month'));
      })
    );
  }

  async save(): Promise<void> {
    if (!this.formGroup.valid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const raw = this.formGroup.getRawValue();

    const payload: any = {
      ...this.data.payment,
      ...raw,
      fromDate:  moment.isMoment(raw.fromDate)  ? Timestamp.fromDate(raw.fromDate.toDate())  : raw.fromDate,
      toDate:    moment.isMoment(raw.toDate)    ? Timestamp.fromDate(raw.toDate.toDate())    : raw.toDate,
      createdAt: moment.isMoment(raw.createdAt) ? Timestamp.fromDate(raw.createdAt.toDate()) : raw.createdAt,
      updatedAt: Timestamp.now(),
    };

    try {
      // Find by payment id field and update
      const col = collection(this.firestore, 'users-payments');
      const q = query(col, where('id', '==', this.data.payment.id));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        await updateDoc(snapshot.docs[0].ref, payload);
      } else {
        // fallback: update by docId
        await updateDoc(doc(this.firestore, 'users-payments', this.data.docId), payload);
      }

      this.snackBar.open('Оплату оновлено', 'Закрити', {duration: 2000});
      this.dialogRef.close(payload);
    } catch (error) {
      console.error('❌ Помилка збереження:', error);
      this.snackBar.open('Помилка збереження', 'Закрити', {duration: 2000});
    } finally {
      this.isSaving = false;
    }
  }

  close(): void {
    this.dialogRef.close(null);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
