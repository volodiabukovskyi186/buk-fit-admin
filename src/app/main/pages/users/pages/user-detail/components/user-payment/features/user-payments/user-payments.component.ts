import {Component, OnInit, signal, ViewEncapsulation, WritableSignal} from '@angular/core';
import {
  collection,
  doc, DocumentSnapshot,
  Firestore,
  getDocs,
  limit, orderBy,
  query,
  setDoc,
  startAfter, Timestamp,
  updateDoc,
  where
} from '@angular/fire/firestore';
import {ActivatedRoute} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {UserPaymentTemplate} from '../../../../../../../../../core/interfaces/user-payment-template.interface';
import {HSSelectModule} from '../../../../../../../../../core/components/select/select.module';
import {USER_PAYMENTS_TARIFF_ENUM} from '../../../../../../../../../core/enums/user-payments-tariff.enum';
import {CommonModule, DatePipe, JsonPipe, NgIf} from '@angular/common';
import {DateFirebasePipe} from '../../../../../../../../../core/pipes/date/date-firebase.pipe';
import {HSButtonModule} from '../../../../../../../../../core/components/button';
import {ClientInterface} from '../../../../../../../../../core/interfaces/user.interface';
import {TableGridDataTypeEnum, TableGridModule} from '../../../../../../../../../core/components/table-grid';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {USER_ROLES_ENUM} from '../../../../../../../../../core/enums/users-roles.enum';
import {PAYMENT_STATUS_ENUM} from '../../../../../../../../../core/enums/payments-status.enum';
import {ConfirmDialogComponent} from '../../../../../../../../../core/dialogs/confirm-dialog/confirm-dialog.component';
import {filter} from 'rxjs';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {HSIconButtonModule} from '../../../../../../../../../core/components/icon-button';
import {HSStatusModule} from '../../../../../../../../../core/components/status/status.module';
import {environment} from '../../../../../../../../../../environments/environment';
import {UsersService} from '../../../../../../users.service';
import {TRAINING_TYPE_ENUM} from '../../../../../../../../../core/enums/training-type.enum';

@Component({
  selector: 'bk-user-payments',
  standalone: true,
  imports: [
    CommonModule,
    HSSelectModule,
    NgIf,
    DatePipe,
    DateFirebasePipe,
    HSButtonModule,
    TableGridModule,
    MatPaginator,
    MatDialogModule,
    JsonPipe,
    HSIconButtonModule,
    HSStatusModule
  ],
  templateUrl: './user-payments.component.html',
  styleUrl: './user-payments.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class UserPaymentsComponent implements OnInit {
  protected readonly tableGridDataTypeEnum = TableGridDataTypeEnum;
  protected readonly userPaymentsTariffEnum = USER_PAYMENTS_TARIFF_ENUM;
  id: string;
  user: ClientInterface;
  currentPayment: WritableSignal<UserPaymentTemplate> = signal(null)
  private botToken = environment.clientBUKBotToken;
  payments = [];
  totalpaymentsCount = 0;
  pageSize = 10; // Початковий розмір сторінки
  lastVisible: DocumentSnapshot | null = null; // Для пагінації
  private dateFirebase = new DateFirebasePipe();


  constructor(
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private usersService: UsersService,
    private firestore: Firestore,
    private dialog: MatDialog,
  ) {
  }

  getFormatted(value: any) {
    return this.dateFirebase.transform(value);
  }
  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    this.getUserById(this.id)
    this.getPaymentsId(this.id);
    this.getTotalpaymentsCount();
    this.getpayments();
  }

  async getUserById(id: string): Promise<void> {
    try {
      const clientsCollection = collection(this.firestore, 'clients');
      const q = query(clientsCollection, where('id', '==', id));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        this.user = (snapshot.docs[0].data() as any);
      } else {
        console.warn("⚠️ Користувач не знайдений.");
      }
    } catch (error) {
      console.error("❌ Помилка отримання користувача:", error);
    }
  }

  async getPaymentsId(userId: string): Promise<void> {
    const clientsCollection = collection(this.firestore, 'payments-template');
    const q = query(clientsCollection, where('userId', '==', userId));

    try {
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const data: UserPaymentTemplate = (snapshot.docs[0].data() as UserPaymentTemplate);
        this.currentPayment.set(data);
      }
    } catch (error) {
      console.error('❌ Помилка отримання даних:', error);
    }
  }

  addPayment(): void {
    this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      height: '200px',
      data: {
        title: 'Увага!',
        text: `Ви справді хочете додати оплату користувачу?`
      }
    }).afterClosed().pipe(filter(Boolean)).subscribe(data => {
      this.sendToClientPayment();

    });
  }

  async sendToClientPayment(): Promise<void> {
    const payload = this.preparePayload();
    const isCanAdd = this.payments.findIndex((payment) => payment.status === PAYMENT_STATUS_ENUM.ACTIVE);

    if(isCanAdd !== -1) {
      this.snackBar.open('В користувача є активна оплата, щоб створити нову видаліть активну', 'Закрити', {duration: 2000});
      return;
    }

    const clientsCollection = collection(this.firestore, 'users-payments');
    try {
      await setDoc(doc(clientsCollection), payload);
      this.snackBar.open('Запит на оплату надісланий користувачу', 'Закрити', {duration: 2000});
      this.getTotalpaymentsCount();
      this.getpayments();
      this.sendMessagePay(payload)
    } catch (error) {
      console.error('❌ Помилка оновлення:', error);
    }
  }

  private preparePayload(): any {
    return {
      ...this.currentPayment(),
      id: this.generateUUID(),
      createdAt: Timestamp.now(),
      status:PAYMENT_STATUS_ENUM.ACTIVE,
    }
  }

  private generateUUID(): string {
    let dt = new Date().getTime();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }


  getTotalpaymentsCount(): void {
    const exercisesCollection = collection(this.firestore, 'users-payments');

    const q = query(
      exercisesCollection,
      where('userId', '==', this.id),
      orderBy('createdAt', 'desc')
    );

    getDocs(q)
      .then(snapshot => {
        this.totalpaymentsCount = snapshot.size;
        console.log('📊 Загальна кількість оплат:', this.totalpaymentsCount);
      })
      .catch(error => console.error("❌ Помилка отримання кількості оплат: ", error));
  }

  getpayments(pageIndex: number = 0, newPageSize: number = this.pageSize): void {
    this.pageSize = newPageSize; // ✅ Оновлюємо `pageSize`
    console.log(11111,  this.id)
    const filters = [];
    filters.push(where('userId', '==', this.id));

    let exercisesCollection = collection(this.firestore, 'users-payments');

    let q = query(
      exercisesCollection,
      ...filters,
      orderBy('createdAt', 'desc'),
      limit(this.pageSize)
    );

    if (this.lastVisible && pageIndex > 0) {
      q = query(q, startAfter(this.lastVisible)); // Завантажуємо наступну сторінку
    } else {
      this.lastVisible = null; // ✅ Скидаємо `lastVisible`, якщо змінюється `pageSize`
    }

    getDocs(q).then(snapshot => {
      if (!snapshot.empty) {
        this.lastVisible = snapshot.docs[snapshot.docs.length - 1];
        this.payments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
    }).catch(error => console.error("Помилка отримання оплат: ", error));
  }


  async updateUserPaymentStatus(id: string): Promise<void> {
    this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      height: '200px',
      data: {
        title: 'Увага!',
        text: `Ви справді хочете змінити статус на не активний?`
      }
    }).afterClosed().pipe(filter(Boolean)).subscribe(data => {
      this.disableStatusByFieldId(id);
    });

  }

  async disableStatusByFieldId(targetId: string): Promise<void> {
    try {
      const q = query(
        collection(this.firestore, 'users-payments'),
        where('id', '==', targetId)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        this.snackBar.open('Документ не знайдено', 'Закрити', { duration: 3000 });
        return;
      }

      const docRef = snapshot.docs[0].ref;

      await updateDoc(docRef, {
        status: PAYMENT_STATUS_ENUM.NOT_ACTIVE
      });

      this.snackBar.open('Статус успішно оновлено', 'Закрити', { duration: 2000 });
      this.getpayments();
    } catch (error) {
      console.error('❌ Помилка при оновленні статусу:', error);
      this.snackBar.open('Не вдалося оновити статус', 'Закрити', { duration: 3000 });
    }
  }

  sendMessagePay(payment: UserPaymentTemplate): any {
    const chatId = this.user?.tgUser?.id;
    if(!chatId) return;

    const apiUrl = `https://api.telegram.org/bot${this.botToken}/sendMessage`;

    const message = `
<b>Привіт, ${this.user.name}! 👋</b>

✨ Дякуємо, що тренеруєшся з нами!

📢 <b>У вас зʼявилась нова оплата за тренування.</b>

📅 <b>Період:</b> ${this.getFormatted(payment.fromDate)} — ${this.getFormatted(payment.toDate)}
💰 <b>Сума до сплати:</b> ${payment.price.toLocaleString()} грн

<i>Для зручності можете перейти в додаток за кнопкою нижче.</i>
`;

    const formData = new FormData();
    formData.append('chat_id', String(chatId));
    formData.append('text', message);
    formData.append('parse_mode', 'html');
    formData.append('reply_markup', JSON.stringify({
      inline_keyboard: [[
        {
          text: 'Відкрити сторінку оплати',
          web_app: { url: `${environment.miniAppLink}/client/payment` },
        }
      ]]
    }));

    this.usersService.sendMessage(apiUrl, formData).subscribe(response => {
      console.log('response', response);
      this.snackBar.open('Повідомлення про оплату надіслано успішно', 'Закрити', { duration: 2000 });
    });
  }


  onPageChange(event: PageEvent) {
    console.log("📌 Зміна сторінки:", event);

    // ✅ Передаємо новий `pageSize`, якщо він змінюється
    this.getpayments(event.pageIndex, event.pageSize);
  }

}
