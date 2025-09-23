import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {DatePipe, NgIf} from "@angular/common";
import {HSStatusModule} from "../../../../../../../core/components/status/status.module";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {TableGridDataTypeEnum, TableGridModule} from "../../../../../../../core/components/table-grid";
import {ClientInterface, UserInterface} from '../../../../../../../core/interfaces/user.interface';
import {
  collection,
  DocumentSnapshot,
  Firestore,
  getDocs,
  limit,
  query,
  startAfter,
  where
} from '@angular/fire/firestore';
import {Subscription} from 'rxjs';
import {AuthService} from '../../../../../../../core/services/auth/auth.service';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {USER_ROLES_ENUM} from '../../../../../../../core/enums/users-roles.enum';

@Component({
  selector: 'bk-coach-clients',
  standalone: true,
    imports: [
        DatePipe,
        HSStatusModule,
        MatPaginator,
        NgIf,
        TableGridModule
    ],
  templateUrl: './coach-clients.component.html',
  styleUrl: './coach-clients.component.scss'
})
export class CoachClientsComponent  implements OnInit, OnDestroy {
  tableGridDataTypeEnum = TableGridDataTypeEnum;
  @ViewChild(MatPaginator) paginator: MatPaginator; // Додаємо пагінатор

  users: ClientInterface[] = [];
  totalUsersCount = 0;
  pageSize = 10; // Початковий розмір сторінки
  lastVisible: DocumentSnapshot | null = null; // Для пагінації
  user:UserInterface;

  coachId: string;

  private subscription: Subscription = new Subscription();
  constructor(
    private authService: AuthService,
    private dialog: MatDialog,
    private firestore: Firestore,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.coachId = this.route.snapshot.params['id'];
    this.getTotalUsersCount();
    this.getUsers();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }


  getTotalUsersCount() {
    const clientsCollection = collection(this.firestore, 'clients');
    // const filterWere = this.user.role === USER_ROLES_ENUM.TRAINER ?  where('coachId', '==', this.coachId) : null;
    const q = query(clientsCollection, where('coachId', '==', this.coachId));

    getDocs(q).then(snapshot => {
      this.totalUsersCount = snapshot.size;
    }).catch(error => console.error("Помилка отримання кількості користувачів: ", error));
  }

  getUsers(pageIndex: number = 0, newPageSize: number = this.pageSize): void {
    this.pageSize = newPageSize; // ✅ Оновлюємо `pageSize`
    const filters = [];
    filters.push(where('coachId', '==', this.coachId));

    let clientsCollection = collection(this.firestore, 'clients');
    let q = query(
      clientsCollection,
      ...filters,
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
