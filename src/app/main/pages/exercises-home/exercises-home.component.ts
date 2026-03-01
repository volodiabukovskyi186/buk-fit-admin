import { Component, OnInit, ViewChild } from '@angular/core';
import { TableGridDataTypeEnum } from "../../../core/components/table-grid";
import { MatDialog } from "@angular/material/dialog";
import { UsersService } from "../users/users.service";
import { Firestore, collection, getDocs, query, where, deleteDoc, doc, orderBy, limit, startAfter, DocumentSnapshot } from '@angular/fire/firestore';
import { Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { forkJoin, switchMap, from } from "rxjs";

@Component({
  selector: 'app-exercises',
  templateUrl: './exercises-home.component.html',
  styleUrls: ['./exercises-home.component.scss']
})
export class ExercisesHomeComponent implements OnInit {
  tableGridDataTypeEnum = TableGridDataTypeEnum;
  @ViewChild(MatPaginator) paginator: MatPaginator; // Додаємо пагінатор

  users = [];
  totalUsersCount = 0;
  pageSize = 100; // Початковий розмір сторінки
  lastVisible: DocumentSnapshot | null = null; // Для пагінації

  constructor(
    private dialog: MatDialog,
    private usersService: UsersService,
    private firestore: Firestore,
    public snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getTotalUsersCount();
    this.getUsers();
  }

  getTotalUsersCount() {
    const exercisesCollection = collection(this.firestore, 'exercise-names-home');
    getDocs(exercisesCollection).then(snapshot => {
      this.totalUsersCount = snapshot.size;
    }).catch(error => console.error("Помилка отримання кількості вправ: ", error));
  }

  getUsers(pageIndex: number = 0, newPageSize: number = this.pageSize): void {
    this.pageSize = newPageSize; // ✅ Оновлюємо `pageSize`

    let exercisesCollection = collection(this.firestore, 'exercise-names-home');
    let q = query(
      exercisesCollection,
      limit(this.pageSize)
    );

    // let q = query(
    //   exercisesCollection,
    //   orderBy('createdAt', 'desc'),
    //   limit(this.pageSize)
    // );


    if (this.lastVisible && pageIndex > 0) {
      q = query(q, startAfter(this.lastVisible)); // Завантажуємо наступну сторінку
    } else {
      this.lastVisible = null; // ✅ Скидаємо `lastVisible`, якщо змінюється `pageSize`
    }

    getDocs(q).then(snapshot => {
      if (!snapshot.empty) {
        this.lastVisible = snapshot.docs[snapshot.docs.length - 1];
        this.users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('1111, this.users', this.users)
      }
    }).catch(error => console.error("Помилка отримання вправ: ", error));
  }

  onPageChange(event: PageEvent) {
    console.log("📌 Зміна сторінки:", event);

    // ✅ Передаємо новий `pageSize`, якщо він змінюється
    this.getUsers(event.pageIndex, event.pageSize);
  }

  deleteExercise(exercise) {
    const collectionRef = collection(this.firestore, 'exercise-names-home');
    const q = query(collectionRef, where('id', '==', exercise.id));

    getDocs(q).then(snapshot => {
      if (!snapshot.empty) {
        snapshot.forEach(docSnapshot => {
          const docRef = doc(this.firestore, 'exercise-names-home', docSnapshot.id);
          deleteDoc(docRef).then(() => {
            this.snackBar.open('Вправу успішно видалено', 'Закрити', { duration: 2000 });
            this.getUsers(); // Оновлюємо список після видалення
          }).catch(error => console.error("Помилка видалення вправи:", error));
        });
      }
    }).catch(error => console.error("Помилка пошуку вправи:", error));
  }

  moveToExegesis(id) {
    this.router.navigate([`/exercises-home/edit-exercise`, id]);
  }

  moveToTGExegesis(link: string) {
    window.open(link);
  }
}
