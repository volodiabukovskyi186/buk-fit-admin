import { Component } from '@angular/core';
import { TableGridDataTypeEnum } from "../../../core/components/table-grid";
import { MatDialog } from "@angular/material/dialog";
import { UsersService } from "../users/users.service";
import { Firestore, collection, collectionData, getDocs, query, where, deleteDoc, doc } from '@angular/fire/firestore'; // ✅ Новий Firestore API
import { Router } from "@angular/router";
import { Action } from "rxjs/internal/scheduler/Action";
import { forkJoin, switchMap, from } from "rxjs";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: 'app-ingredients',
  templateUrl: './ingredients.component.html',
  styleUrls: ['./ingredients.component.scss']
})
export class IngredientsComponent {
  tableGridDataTypeEnum = TableGridDataTypeEnum;
  post;
  users = [];
  messages = [];
  totalUsersCount = 0;

  constructor(
    private dialog: MatDialog,
    private usersService: UsersService,
    private firestore: Firestore, // ✅ Використовуємо Firestore замість `AngularFirestore`
    public snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getUsers();
    this.getTotalUsersCount();
  }

  getTotalUsersCount() {
    const productsCollection = collection(this.firestore, 'products');
    getDocs(productsCollection).then(snapshot => {
      this.totalUsersCount = snapshot.size;
    }).catch(error => console.error("Помилка отримання кількості продуктів: ", error));
  }

  getUsers(): void {
    const productsCollection = collection(this.firestore, 'products');
    collectionData(productsCollection, { idField: 'id' }).subscribe(
      (data: any) => {
        this.users = data;
        console.log(' this.users ', this.users);
      },
      error => console.error("Помилка отримання користувачів: ", error)
    );
  }

  protected readonly Action = Action;

  deleteExercise(exercise) {
    const userCollections = ['products'];
    const deleteObservables = userCollections.map(collectionName => {
      const collectionRef = collection(this.firestore, collectionName);
      const q = query(collectionRef, where('id', '==', exercise.id));
      return from(getDocs(q));
    });

    forkJoin(deleteObservables).pipe(
      switchMap(snapshots => {
        const deleteActions = [];

        snapshots.forEach((snapshot, index) => {
          if (!snapshot.empty) {
            snapshot.forEach(docSnapshot => {
              const docRef = doc(this.firestore, userCollections[index], docSnapshot.id);
              deleteActions.push(from(deleteDoc(docRef)));
            });
          }
        });

        return forkJoin(deleteActions);
      })
    ).subscribe(
      () => {
        this.snackBar.open('Продукт успішно видалено', 'Закрити', { duration: 2000 });
      },
      error => {
        console.error('Помилка видалення документа: ', error);
      }
    );
  }
}
