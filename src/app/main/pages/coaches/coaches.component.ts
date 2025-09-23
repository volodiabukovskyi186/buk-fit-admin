import { Component, OnInit, ViewChild } from '@angular/core';
import { Firestore, collection, query, where, orderBy, limit, startAfter, getDocs, DocumentSnapshot } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import {TableGridDataTypeEnum} from '../../../core/components/table-grid';
import {USER_ROLES_ENUM} from '../../../core/enums/users-roles.enum';

@Component({
  selector: 'app-coach',
  templateUrl: './coaches.component.html',
  styleUrls: ['./coaches.component.scss'],
})
export class CoachesComponent implements OnInit {
  tableGridDataTypeEnum = TableGridDataTypeEnum;
  @ViewChild(MatPaginator) paginator: MatPaginator; // Додаємо пагінатор

  users = [];
  totalUsersCount = 0;
  pageSize = 10; // Початковий розмір сторінки
  lastVisible: DocumentSnapshot | null = null; // Для пагінації

  constructor(
    private dialog: MatDialog,
    private firestore: Firestore,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getTotalUsersCount();
    this.getUsers();
  }


  getTotalUsersCount() {
    const clientsCollection = collection(this.firestore, 'admins');
    const q = query(clientsCollection, where('role', '==', USER_ROLES_ENUM.TRAINER));

    getDocs(q).then(snapshot => {
      this.totalUsersCount = snapshot.size;
    }).catch(error => console.error("Помилка отримання кількості користувачів: ", error));
  }

  getUsers(pageIndex: number = 0, newPageSize: number = this.pageSize): void {
    this.pageSize = newPageSize; // ✅ Оновлюємо `pageSize`

    let clientsCollection = collection(this.firestore, 'admins');
    let q = query(
      clientsCollection,
      orderBy('createdAt', 'desc'),
      limit(this.pageSize),
      where('role', '==', USER_ROLES_ENUM.TRAINER)
    );

    if (this.lastVisible && pageIndex > 0) {
      q = query(q, startAfter(this.lastVisible)); // Завантажуємо наступну сторінку
    } else {
      this.lastVisible = null; // ✅ Скидаємо `lastVisible`, якщо змінюється `pageSize`
    }

    getDocs(q).then(snapshot => {
      if (!snapshot.empty) {
        this.lastVisible = snapshot.docs[snapshot.docs.length - 1];

        this.users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log(999, this.users)
      }
    }).catch(error => console.error("Помилка отримання користувачів: ", error));
  }

  onPageChange(event: PageEvent) {
    console.log("📌 Зміна сторінки:", event);

    // ✅ Передаємо новий `pageSize`, якщо він змінюється
    this.getUsers(event.pageIndex, event.pageSize);
  }

  moveToMessage(id): void {
    this.router.navigate([`/coaches/coach/`, id]);
  }
}
