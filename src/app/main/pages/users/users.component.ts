import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
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
import {Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {TableGridDataTypeEnum} from '../../../core/components/table-grid';
import {ClientInterface, UserInterface} from '../../../core/interfaces/user.interface';
import {AuthService} from '../../../core/services/auth/auth.service';
import {Subscription} from 'rxjs';
import {USER_ROLES_ENUM} from '../../../core/enums/users-roles.enum';
import {PAYMENT_DATE_ENUM} from '../../../core/enums/payment-date/payment-date.enum';
import {BKCheckPaymentDateService} from '../../../core/services/date/check-payment-date.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit, OnDestroy {
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
    const filters = [];

    if (this.user.role === USER_ROLES_ENUM.TRAINER) {
      filters.push(where('coachId', '==', this.user.id));
    }

    filters.push(where('status', 'in', ['ACTIVE', 'NEW', 'BLOCKED']));

    const q = query(clientsCollection, ...filters);

    getDocs(q)
      .then(snapshot => {
        this.totalUsersCount = snapshot.size;
      })
      .catch(error => console.error("Помилка отримання кількості користувачів: ", error));
  }

  getUsers(pageIndex: number = 0, newPageSize: number = this.pageSize): void {
    this.pageSize = newPageSize;
    const filters = [];
    if (this.user.role === USER_ROLES_ENUM.TRAINER) {
      filters.push(where('coachId', '==', this.user.id));
    }

    filters.push(where('status', 'in', ['ACTIVE', 'NEW', 'BLOCKED']));

    let clientsCollection = collection(this.firestore, 'clients');
    let q = query(
      clientsCollection,
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
        this.users = (snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any);
        this.users =  this.users.map((user: any) => {
          (user.paymentStatus as any) = this.bkCheckPaymentDateService.checkPaymentDate(user.payDate);
          console.log('32', user)
          return user;
        });


      }
    }).catch(error => console.error("Помилка отримання користувачів: ", error));
  }


  onPageChange(event: PageEvent) {
    console.log("📌 Зміна сторінки:", event);

    // ✅ Передаємо новий `pageSize`, якщо він змінюється
    this.getUsers(event.pageIndex, event.pageSize);
  }

  moveToMessage(id): void {
    this.router.navigate([`/users/user/`, id]);
  }

  moveToTg(tgUser: any) {
    window.open(`https://t.me/${tgUser.username}`);
  }
}
