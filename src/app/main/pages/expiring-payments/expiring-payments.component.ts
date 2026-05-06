import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {DatePipe, NgClass, NgIf} from '@angular/common';
import {HSStatusModule} from '../../../core/components/status/status.module';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {TableGridDataTypeEnum, TableGridModule} from '../../../core/components/table-grid';
import {ClientInterface, UserInterface} from '../../../core/interfaces/user.interface';
import {
  collection,
  DocumentSnapshot,
  Firestore,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where
} from '@angular/fire/firestore';
import {PAYMENT_DATE_ENUM} from '../../../core/enums/payment-date/payment-date.enum';
import {USER_ROLES_ENUM} from '../../../core/enums/users-roles.enum';
import {Subscription} from 'rxjs';
import {BKCheckPaymentDateService} from '../../../core/services/date/check-payment-date.service';
import {AuthService} from '../../../core/services/auth/auth.service';
import {MatDialog} from '@angular/material/dialog';
import {Router} from '@angular/router';
import {DateFirebasePipe} from '../../../core/pipes/date/date-firebase.pipe';

@Component({
  selector: 'app-expiring-payments',
  standalone: true,
  imports: [
    DatePipe,
    HSStatusModule,
    MatPaginator,
    NgIf,
    TableGridModule,
    NgClass,
    DateFirebasePipe
  ],
  templateUrl: './expiring-payments.component.html',
  styleUrl: './expiring-payments.component.scss'
})
export class ExpiringPaymentsComponent implements OnInit, OnDestroy {
  tableGridDataTypeEnum = TableGridDataTypeEnum;
  @ViewChild(MatPaginator) paginator: MatPaginator; // Додаємо пагінатор

  users: ClientInterface[] | any[] = [];
  totalUsersCount = 0;
  pageSize = 10; // Початковий розмір сторінки
  lastVisible: DocumentSnapshot | null = null; // Для пагінації
  user:UserInterface;
  paymentDateEnum = PAYMENT_DATE_ENUM;
  userRoleEnum = USER_ROLES_ENUM;
  private subscription: Subscription = new Subscription();
  constructor(
    private bkCheckPaymentDateService: BKCheckPaymentDateService,
    private authService: AuthService,
    private dialog: MatDialog,
    private firestore: Firestore,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getUserState();

  }


  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private getUserState(): void {
    const  stream$  = this.authService.userState$.subscribe((user: UserInterface) => {
      this.user = user;
      this.getTotalUsersCount();
      this.getUsers();
    });

    this.subscription.add(stream$);
  }

  getTotalUsersCount() {
    const clientsCollection = collection(this.firestore, 'clients');
    const filterWere =  null;
    // const q = query(clientsCollection, orderBy('endDate', 'desc'), filterWere);
    const filters = [];
    let q = query(
      clientsCollection,
      ...filters,
      orderBy('endDate', 'desc'),
      limit(this.pageSize)
    );
    getDocs(q).then(snapshot => {
      this.totalUsersCount = snapshot.size;
    }).catch(error => console.error("Помилка отримання кількості користувачів: ", error));
  }

  getUsers(pageIndex: number = 0, newPageSize: number = this.pageSize): void {
    this.pageSize = newPageSize;
    const filters = [];


    let clientsCollection = collection(this.firestore, 'clients');
    let q = query(
      clientsCollection,
      ...filters,
      orderBy('endDate', 'desc'),
      limit(this.pageSize)
    );

    if (this.lastVisible && pageIndex > 0) {
      q = query(q, startAfter(this.lastVisible));
    } else {
      this.lastVisible = null;
    }

    getDocs(q).then(snapshot => {
      if (!snapshot.empty) {
        this.lastVisible = snapshot.docs[snapshot.docs.length - 1];
        this.users = (snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any);
        this.users =  this.users.map((user: any) => {
          (user.paymentStatus as any) = this.bkCheckPaymentDateService.checkPaymentDate(user.endDate);
          return user;
        });


      }
    }).catch(error => console.error("Помилка отримання користувачів: ", error));
  }


  onPageChange(event: PageEvent) {

    // ✅ Передаємо новий `pageSize`, якщо він змінюється
    this.getUsers(event.pageIndex, event.pageSize);
  }

  moveToMessage(id): void {
    this.router.navigate([`/users-payments/user/`, id]);
  }

  moveToTg(tgUser: any) {
    window.open(`https://t.me/${tgUser.username}`);
  }
}
