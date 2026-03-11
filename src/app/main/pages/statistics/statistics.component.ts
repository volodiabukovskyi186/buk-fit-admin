import {ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatMomentDateModule, MomentDateAdapter} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {collection, deleteDoc, Firestore, getDocs, orderBy, query, Timestamp, where} from '@angular/fire/firestore';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog} from '@angular/material/dialog';
import {Chart, registerables} from 'chart.js';
import moment from 'moment';
import {CUSTOM_DATE_FORMATS} from '../../../app.config';
import {MatDialogModule} from '@angular/material/dialog';
import {HSButtonModule} from '../../../core/components/button';
import {HSFormFieldModule} from '../../../core/components/form-field';
import {HSIconButtonModule} from '../../../core/components/icon-button';
import {HSInputModule} from '../../../core/components/input';
import {EditPaymentDialogComponent} from './edit-payment-dialog/edit-payment-dialog.component';
import {ConfirmDialogComponent} from '../../../core/dialogs/confirm-dialog/confirm-dialog.component';
import {filter} from 'rxjs';

Chart.register(...registerables);

@Component({
  selector: 'bk-statistics',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatMomentDateModule,
    MatDialogModule,
    HSButtonModule,
    HSFormFieldModule,
    HSIconButtonModule,
    HSInputModule,
  ],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.scss',
  providers: [
    {provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS},
    {deps: [MAT_DATE_LOCALE], provide: DateAdapter, useClass: MomentDateAdapter},
  ]
})
export class StatisticsComponent implements OnInit, OnDestroy {
  @ViewChild('chartCanvas', {static: false}) chartCanvas: ElementRef<HTMLCanvasElement>;

  formGroup: FormGroup;
  isLoading = false;
  hasData = false;

  totalCount = 0;
  renewalCount = 0;
  newCount = 0;
  totalRevenue = 0;

  payments: any[] = [];

  private chart: Chart | null = null;

  constructor(
    private fb: FormBuilder,
    private firestore: Firestore,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      fromDate: [moment().startOf('month')],
      toDate: [moment().endOf('month')],
    });

    this.loadStats();
  }

  async loadStats(): Promise<void> {
    const {fromDate, toDate} = this.formGroup.value;
    if (!fromDate || !toDate) {
      this.snackBar.open('Виберіть діапазон дат', 'Закрити', {duration: 2000});
      return;
    }

    this.isLoading = true;
    const from = Timestamp.fromDate(moment(fromDate).startOf('day').toDate());
    const to = Timestamp.fromDate(moment(toDate).endOf('day').toDate());

    try {
      const col = collection(this.firestore, 'users-payments');
      const q = query(col, where('createdAt', '>=', from), where('createdAt', '<=', to), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      this.payments = snapshot.docs.map(d => ({...d.data() as any, _docId: d.id}));

      this.totalCount = this.payments.length;
      this.renewalCount = this.payments.filter(p => p.isRenewal === true).length;
      this.newCount = this.payments.filter(p => !p.isRenewal).length;
      this.totalRevenue = this.payments.reduce((sum, p) => sum + (Number(p.price) || 0), 0);

      this.hasData = true;
      this.cdr.detectChanges(); // ensure *ngIf renders canvas before chart init
      this.buildChart([...this.payments].reverse());
    } catch (error) {
      console.error('❌ Помилка завантаження статистики:', error);
      this.snackBar.open('Помилка завантаження даних', 'Закрити', {duration: 2000});
    } finally {
      this.isLoading = false;
    }
  }

  getTariffLabel(tariff: string): string {
    const map: Record<string, string> = {BASIC: 'Базовий', STANDARD: 'Стандарт', PREMIUM: 'Преміум'};
    return map[tariff] || tariff;
  }

  getPaymentDate(p: any): string {
    const date = p.createdAt?.toDate ? p.createdAt.toDate() : (p.createdAt ? new Date(p.createdAt) : null);
    return date ? moment(date).format('DD.MM.YYYY') : '—';
  }

  deletePayment(payment: any): void {
    this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {title: 'Видалити оплату?', text: `Оплата клієнта ${payment.userId} буде видалена безповоротно.`}
    }).afterClosed().pipe(filter(Boolean)).subscribe(async () => {
      try {
        const col = collection(this.firestore, 'users-payments');
        const q = query(col, where('id', '==', payment.id));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) await deleteDoc(snapshot.docs[0].ref);

        this.payments = this.payments.filter(p => p.id !== payment.id);
        this.totalCount = this.payments.length;
        this.renewalCount = this.payments.filter(p => p.isRenewal === true).length;
        this.newCount = this.payments.filter(p => !p.isRenewal).length;
        this.totalRevenue = this.payments.reduce((sum, p) => sum + (Number(p.price) || 0), 0);
        this.buildChart([...this.payments].reverse());
        this.snackBar.open('Оплату видалено', 'Закрити', {duration: 2000});
      } catch (e) {
        console.error(e);
        this.snackBar.open('Помилка видалення', 'Закрити', {duration: 2000});
      }
    });
  }

  openEdit(payment: any): void {
    const ref = this.dialog.open(EditPaymentDialogComponent, {
      data: {payment, docId: payment._docId},
      panelClass: 'bk-edit-payment-panel',
      maxWidth: '100vw',
    });

    ref.afterClosed().subscribe(updated => {
      if (updated) {
        const idx = this.payments.findIndex(p => p.id === payment.id);
        if (idx !== -1) this.payments[idx] = {...updated, _docId: payment._docId};
      }
    });
  }

  getTimestampDate(value: any): string {
    if (!value) return '—';
    const date = value?.toDate ? value.toDate() : new Date(value);
    return moment(date).format('DD.MM.YYYY');
  }

  private buildChart(payments: any[]): void {
    const grouped: Record<string, {total: number; renewals: number; newUsers: number}> = {};

    payments.forEach(p => {
      const date = p.createdAt?.toDate ? p.createdAt.toDate() : new Date(p.createdAt);
      const key = moment(date).format('MM.YYYY');
      if (!grouped[key]) grouped[key] = {total: 0, renewals: 0, newUsers: 0};
      grouped[key].total++;
      if (p.isRenewal === true) grouped[key].renewals++;
      else grouped[key].newUsers++;
    });

    const labels = Object.keys(grouped);
    const renewalData = labels.map(k => grouped[k].renewals);
    const newData = labels.map(k => grouped[k].newUsers);

    if (this.chart) this.chart.destroy();

    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Нові клієнти',
            data: newData,
            backgroundColor: 'rgba(63, 161, 251, 0.85)',
            borderColor: 'rgba(63, 161, 251, 1)',
            borderWidth: 0,
            borderRadius: 6,
            borderSkipped: false,
          },
          {
            label: 'Продовження',
            data: renewalData,
            backgroundColor: 'rgba(39, 174, 96, 0.85)',
            borderColor: 'rgba(39, 174, 96, 1)',
            borderWidth: 0,
            borderRadius: 6,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {mode: 'index', intersect: false},
        plugins: {
          legend: {
            position: 'top',
            labels: {
              font: {family: 'Montserrat', size: 12},
              padding: 16,
              usePointStyle: true,
              pointStyle: 'circle',
            },
          },
          tooltip: {
            backgroundColor: '#1a1f2e',
            titleFont: {family: 'Montserrat', size: 13, weight: 'bold'},
            bodyFont: {family: 'Montserrat', size: 12},
            padding: 12,
            cornerRadius: 8,
            borderColor: 'rgba(63,161,251,0.3)',
            borderWidth: 1,
          },
        },
        scales: {
          x: {
            stacked: true,
            grid: {display: false},
            ticks: {font: {family: 'Montserrat', size: 11}},
          },
          y: {
            stacked: true,
            beginAtZero: true,
            ticks: {stepSize: 1, font: {family: 'Montserrat', size: 11}},
            grid: {color: 'rgba(0,0,0,0.06)'},
          },
        },
      },
    });
  }

  ngOnDestroy(): void {
    if (this.chart) this.chart.destroy();
  }
}
