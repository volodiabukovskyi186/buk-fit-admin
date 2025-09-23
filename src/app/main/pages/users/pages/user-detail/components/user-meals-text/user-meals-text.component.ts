import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, getDocs, query, setDoc, updateDoc, where, addDoc } from '@angular/fire/firestore';
import { Storage } from '@angular/fire/storage';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import {filter, Observable} from 'rxjs';
import {MealsNamesDialogComponent} from './dialogs/meals-names-dialog/meals-names-dialog.component';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'bk-user-meals-text',
  templateUrl: './user-meals-text.component.html',
  styleUrls: ['./user-meals-text.component.scss']
})
export class UserMealsTextComponent implements OnInit {
  user: any;
  id: string;
  formGroup: FormGroup;

  constructor(
    private snackBar: MatSnackBar,
    private firestore: Firestore, // ✅ Використовуємо новий Firestore API
    private storage: Storage, // ✅ Використовуємо новий Storage API
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private router: Router,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];

    this.formGroup = this.fb.group({
      text: this.fb.control(null),
      id: this.fb.control(null),
    });

    this.getUserById(this.id);
  }

  openMealsDialog(): void {

    this.dialog.open(MealsNamesDialogComponent, {
      width: '100%',
      maxWidth: '100vw',
      height: '100%',
    }).afterClosed().subscribe(data => {
      if(data !== null) {
        this.formGroup.get('text').setValue(data.comment);
      }

    });
  }

  updateUser(): void {
    const payload = { ...this.formGroup.value };
    const mealsCollection = collection(this.firestore, 'meals');
    const q = query(mealsCollection, where('id', '==', this.user.id));

    getDocs(q).then(snapshot => {
      if (snapshot.empty) {
        // Додаємо новий запис
        addDoc(mealsCollection, payload)
          .then(() => this.snackBar.open('✅ Дані успішно додано', 'Закрити', { duration: 2000 }))
          .catch(error => console.error('❌ Помилка додавання документа: ', error));
      } else {
        // Оновлюємо існуючий запис
        snapshot.forEach(docSnap => {
          const docRef = doc(this.firestore, 'meals', docSnap.id);
          updateDoc(docRef, payload)
            .then(() => this.snackBar.open('✅ Дані успішно оновлено', 'Закрити', { duration: 2000 }))
            .catch(error => console.error('❌ Помилка оновлення документа: ', error));
        });
      }
    });
  }

  getUserById(id: string): void {
    const userCollection = collection(this.firestore, 'clients');
    const q = query(userCollection, where('id', '==', id));

    getDocs(q).then(snapshot => {
      if (!snapshot.empty) {
        this.user = snapshot.docs[0].data();
        this.formGroup.patchValue(this.user);

        this.getCaloriesData();
      } else {
        console.warn("⚠️ Користувач не знайдений.");
      }
    }).catch(error => console.error('❌ Помилка отримання користувача:', error));
  }

  getCaloriesData(): void {
    const mealsCollection = collection(this.firestore, 'meals');
    const q = query(mealsCollection, where('id', '==', this.user.id));

    getDocs(q).then(snapshot => {
      if (!snapshot.empty) {
        snapshot.forEach(docSnap => {
          const userData: any = docSnap.data();
          this.formGroup.setValue(userData);
          console.log('✅ Отримано дані про калорії:', userData);
        });
      }
    }).catch(error => console.error('❌ Помилка отримання даних про калорії:', error));
  }
}
