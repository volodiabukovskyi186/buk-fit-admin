import {Component, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {HSStatusModule} from '../../../../../../../../../core/components/status/status.module';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {TableGridDataTypeEnum, TableGridModule} from '../../../../../../../../../core/components/table-grid';
import {ClientInterface, UserInterface} from '../../../../../../../../../core/interfaces/user.interface';
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
import {PAYMENT_DATE_ENUM} from '../../../../../../../../../core/enums/payment-date/payment-date.enum';
import {USER_ROLES_ENUM} from '../../../../../../../../../core/enums/users-roles.enum';
import {Subscription} from 'rxjs';
import {BKCheckPaymentDateService} from '../../../../../../../../../core/services/date/check-payment-date.service';
import {AuthService} from '../../../../../../../../../core/services/auth/auth.service';
import {Router} from '@angular/router';
import {HSButtonModule} from '../../../../../../../../../core/components/button';
import {HSTooltipModule} from '../../../../../../../../../core/components/tooltip';

@Component({
  selector: 'bk-meals-names-dialog',
  standalone: true,
  imports: [CommonModule, HSStatusModule, MatPaginator, TableGridModule, HSButtonModule, HSTooltipModule],
  templateUrl: './meals-names-dialog.component.html',
  styleUrl: './meals-names-dialog.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class MealsNamesDialogComponent implements OnInit, OnDestroy {
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
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<MealsNamesDialogComponent>,
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

  close(): void {
    this.dialogRef.close(null);
  }

  selectMeal(data): void{
    this.dialogRef.close(data);
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
    const clientsCollection = collection(this.firestore, 'meals-names');
    const filterWere = this.user.role === USER_ROLES_ENUM.TRAINER ?  where('coachId', '==', this.user.id) : null;
    const q = query(clientsCollection, filterWere);

    getDocs(q).then(snapshot => {
      this.totalUsersCount = snapshot.size;
    }).catch(error => console.error("Помилка отримання кількості користувачів: ", error));
  }

  getUsers(pageIndex: number = 0, newPageSize: number = this.pageSize): void {
    this.pageSize = newPageSize; // ✅ Оновлюємо `pageSize`

    let clientsCollection = collection(this.firestore, 'meals-names');
    let q = query(
      clientsCollection,
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

          return user;
        })
      }
    }).catch(error => console.error("Помилка отримання користувачів: ", error));
  }


  onPageChange(event: PageEvent) {
    console.log("📌 Зміна сторінки:", event);

    // ✅ Передаємо новий `pageSize`, якщо він змінюється
    this.getUsers(event.pageIndex, event.pageSize);
  }


}
