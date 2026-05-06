import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatMomentDateModule, MomentDateAdapter} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {collection, Firestore, getDocs, orderBy, query, Timestamp, where} from '@angular/fire/firestore';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Chart, registerables} from 'chart.js';
import moment from 'moment';
import {Subscription} from 'rxjs';
import {HSSelectModule} from 'src/app/core/components/select/select.module';
import {CUSTOM_DATE_FORMATS} from '../../../app.config';
import {HSButtonModule} from '../../../core/components/button';
import {HSFormFieldModule} from '../../../core/components/form-field';
import {HSIconButtonModule} from '../../../core/components/icon-button';
import {HSInputModule} from '../../../core/components/input';
import {VTCoachesService} from '../../../core/services/coaches/coaches.service';
import {AuthService} from '../../../core/services/auth/auth.service';
import {UserInterface} from '../../../core/interfaces/user.interface';
import {USER_ROLES_ENUM} from '../../../core/enums/users-roles.enum';

Chart.register(...registerables);

interface PaymentRecord {
  userId: string;
  coachId: string;
  price: number;
  tariff: 'BASIC' | 'STANDARD' | 'PREMIUM';
  isRenewal: boolean;
  createdAt: Timestamp;
  fromDate: Timestamp;
  toDate: Timestamp;
}

interface CoachRetentionRow {
  coachId: string;
  coachName: string;
  newCount: number;
  renewalCount: number;
  renewalRate: number;
  totalRevenue: number;
}

type QuickFilterRange = '3m' | '6m' | '1y';

@Component({
  selector: 'bk-retention',
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
  templateUrl: './retention.component.html',
  styleUrl: './retention.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS},
    {deps: [MAT_DATE_LOCALE], provide: DateAdapter, useClass: MomentDateAdapter},
  ],
})
export class RetentionComponent implements OnInit, OnDestroy {
  @ViewChild('retentionLineCanvas', {static: false}) retentionLineCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('retentionBarCanvas', {static: false}) retentionBarCanvas!: ElementRef<HTMLCanvasElement>;

  formGroup!: FormGroup;
  isLoading = false;
  hasData = false;

  renewalRate = 0;
  renewalCount = 0;
  newCount = 0;
  uniqueClients = 0;

  coaches: UserInterface[] = [];
  coachRows: CoachRetentionRow[] = [];
  showCoachFilter = true;
  showCoachTable = true;
  activeQuickFilter: QuickFilterRange | null = null;

  private allPayments: PaymentRecord[] = [];
  private filteredPayments: PaymentRecord[] = [];
  private subscription = new Subscription();
  private lineChart: Chart | null = null;
  private barChart: Chart | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly firestore: Firestore,
    private readonly snackBar: MatSnackBar,
    private readonly cdr: ChangeDetectorRef,
    private readonly authService: AuthService,
    private readonly vtCoachesService: VTCoachesService,
  ) {}

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      fromDate: [moment().subtract(1, 'month')],
      toDate: [moment()],
      coachId: [null],
    });

    const auth$ = this.authService.userState$.subscribe(user => {
      if (user?.role === USER_ROLES_ENUM.TRAINER) {
        this.showCoachFilter = false;
        this.showCoachTable = false;
      }
    });
    this.subscription.add(auth$);

    const coaches$ = this.vtCoachesService.getCoaches().subscribe(coaches => {
      if (coaches?.length) {
        this.coaches = coaches;
      } else {
        this.showCoachTable = false;
      }
    });
    this.subscription.add(coaches$);
  }

  setQuickFilter(range: QuickFilterRange): void {
    const ranges: Record<QuickFilterRange, [moment.Moment, moment.Moment]> = {
      '3m': [moment().subtract(3, 'months'), moment()],
      '6m': [moment().subtract(6, 'months'), moment()],
      '1y': [moment().subtract(1, 'year'), moment()],
    };
    this.formGroup.patchValue({fromDate: ranges[range][0], toDate: ranges[range][1]});
    this.activeQuickFilter = range;
    this.loadData();
  }

  async loadData(): Promise<void> {
    const {fromDate, toDate} = this.formGroup.value;
    if (!fromDate || !toDate) {
      this.snackBar.open('Виберіть діапазон дат', 'Закрити', {duration: 2000});
      return;
    }

    this.isLoading = true;
    this.cdr.markForCheck();

    const from = Timestamp.fromDate(moment(fromDate).startOf('day').toDate());
    const to = Timestamp.fromDate(moment(toDate).endOf('day').toDate());

    try {
      const col = collection(this.firestore, 'users-payments');
      const q = query(
        col,
        where('createdAt', '>=', from),
        where('createdAt', '<=', to),
        orderBy('createdAt', 'asc'),
      );
      const snapshot = await getDocs(q);

      this.allPayments = snapshot.docs.map(d => d.data() as PaymentRecord);
      this.applyFilters();

      this.hasData = true;
      this.cdr.detectChanges();
      this.buildLineChart();
      this.buildBarChart();
    } catch (error) {
      console.error('Помилка завантаження даних retention:', error);
      this.snackBar.open('Помилка завантаження даних', 'Закрити', {duration: 2000});
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  applyFilters(): void {
    const coachId = this.formGroup.get('coachId')?.value || null;
    this.filteredPayments = coachId
      ? this.allPayments.filter(p => p.coachId === coachId)
      : [...this.allPayments];

    const total = this.filteredPayments.length;
    this.renewalCount = this.filteredPayments.filter(p => p.isRenewal === true).length;
    this.newCount = this.filteredPayments.filter(p => !p.isRenewal).length;
    this.uniqueClients = new Set(this.filteredPayments.map(p => p.userId)).size;
    this.renewalRate = total > 0 ? Math.round((this.renewalCount / total) * 100) : 0;

    this.buildCoachRows();

    if (this.hasData) {
      this.cdr.detectChanges();
      this.buildLineChart();
      this.buildBarChart();
    }
  }

  getCoachName(coachId: string): string {
    const coach = this.coaches.find(c => c.id === coachId);
    return coach?.name ?? coachId;
  }

  ngOnDestroy(): void {
    this.lineChart?.destroy();
    this.barChart?.destroy();
    this.subscription.unsubscribe();
  }

  private buildCoachRows(): void {
    const grouped: Record<string, {newCount: number; renewalCount: number; totalRevenue: number}> = {};

    for (const p of this.filteredPayments) {
      if (!grouped[p.coachId]) {
        grouped[p.coachId] = {newCount: 0, renewalCount: 0, totalRevenue: 0};
      }
      if (p.isRenewal) {
        grouped[p.coachId].renewalCount++;
      } else {
        grouped[p.coachId].newCount++;
      }
      grouped[p.coachId].totalRevenue += Number(p.price) || 0;
    }

    this.coachRows = Object.entries(grouped).map(([coachId, data]) => {
      const total = data.newCount + data.renewalCount;
      return {
        coachId,
        coachName: this.getCoachName(coachId),
        newCount: data.newCount,
        renewalCount: data.renewalCount,
        renewalRate: total > 0 ? Math.round((data.renewalCount / total) * 100) : 0,
        totalRevenue: data.totalRevenue,
      };
    });
  }

  private resolvePaymentDate(createdAt: Timestamp): Date {
    return createdAt?.toDate ? createdAt.toDate() : new Date(createdAt.seconds * 1000);
  }

  private groupPaymentsByMonth<T>(
    payments: PaymentRecord[],
    factory: () => T,
    accumulate: (acc: T, p: PaymentRecord) => void,
  ): {labels: string[]; groups: Record<string, T>} {
    const groups: Record<string, T> = {};
    for (const p of payments) {
      const key = moment(this.resolvePaymentDate(p.createdAt)).format('MM.YYYY');
      if (!groups[key]) groups[key] = factory();
      accumulate(groups[key], p);
    }
    return {labels: Object.keys(groups), groups};
  }

  private buildLineChart(): void {
    if (!this.retentionLineCanvas) return;

    const {labels, groups} = this.groupPaymentsByMonth<{total: number; renewals: number}>(
      this.filteredPayments,
      () => ({total: 0, renewals: 0}),
      (acc, p) => {
        acc.total++;
        if (p.isRenewal) acc.renewals++;
      },
    );

    const rateData = labels.map(k =>
      groups[k].total > 0 ? Math.round((groups[k].renewals / groups[k].total) * 100) : 0,
    );

    if (this.lineChart) this.lineChart.destroy();

    this.lineChart = new Chart(this.retentionLineCanvas.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Renewal Rate %',
            data: rateData,
            borderColor: 'rgba(63, 161, 251, 1)',
            backgroundColor: 'rgba(63, 161, 251, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointBackgroundColor: 'rgba(63, 161, 251, 1)',
            pointRadius: 4,
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
            callbacks: {
              label: ctx => ` ${ctx.raw}%`,
            },
          },
        },
        scales: {
          x: {
            grid: {display: false},
            ticks: {font: {family: 'Montserrat', size: 11}},
          },
          y: {
            min: 0,
            max: 100,
            beginAtZero: true,
            ticks: {
              font: {family: 'Montserrat', size: 11},
              callback: val => `${val}%`,
            },
            grid: {color: 'rgba(0,0,0,0.06)'},
          },
        },
      },
    });
  }

  private buildBarChart(): void {
    if (!this.retentionBarCanvas) return;

    const {labels, groups} = this.groupPaymentsByMonth<{newUsers: number; renewals: number}>(
      this.filteredPayments,
      () => ({newUsers: 0, renewals: 0}),
      (acc, p) => {
        if (p.isRenewal) acc.renewals++;
        else acc.newUsers++;
      },
    );

    const newData = labels.map(k => groups[k].newUsers);
    const renewalData = labels.map(k => groups[k].renewals);

    if (this.barChart) this.barChart.destroy();

    this.barChart = new Chart(this.retentionBarCanvas.nativeElement, {
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
}
