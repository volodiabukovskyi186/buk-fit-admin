import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  getDocs,
  query,
  where,
  updateDoc,
  setDoc,
  deleteDoc,
  Timestamp
} from '@angular/fire/firestore';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, from, switchMap } from 'rxjs';
import {USER_ROLES_ENUM} from '../../../../../../../core/enums/users-roles.enum';
import {USER_STATUS_ENUM} from '../../../../../../../core/enums/users-status.enum';

@Component({
  selector: 'bk-manager-info',
  templateUrl: './manager-info.component.html',
  styleUrls: ['./manager-info.component.scss']
})
export class ManagerInfoComponent implements OnInit {
  userStatusEnum = USER_STATUS_ENUM;
  userRoleEnum = USER_ROLES_ENUM;
  user: any;
  id: string;
  formGroup: FormGroup;

  constructor(
    private snackBar: MatSnackBar,
    private firestore: Firestore, // ✅ Новий Firestore API
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];

    this.formGroup = this.fb.group({
      name: this.fb.control(null, Validators.required),
      secondName: this.fb.control(null, Validators.required),
      status: this.fb.control(null, Validators.required),
      role: this.fb.control(null, Validators.required),
      phone: this.fb.control(null, Validators.required),
      email: this.fb.control(null, Validators.required),
      createdAt: this.fb.control(null, Validators.required),
      updatedAt: this.fb.control(null),
      id: this.fb.control(null, Validators.required),
    });

    this.formGroup.get('id').disable();
    this.formGroup.get('email').disable();
    this.getUserById(this.id);
  }

  async getUserById(id: string): Promise<void> {
    const clientsCollection = collection(this.firestore, 'admins');
    const q = query(clientsCollection, where('id', '==', id));

    try {
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        this.user = snapshot.docs[0].data();

        this.formGroup.patchValue(this.user);
        this.cdr.detectChanges(); // ✅ Оновлюємо UI
      } else {
        console.warn("⚠️ Користувач не знайдений.");
      }
    } catch (error) {
      console.error("❌ Помилка отримання користувача:", error);
    }
  }

  async updateUser(): Promise<void> {
    const payload = {
      ...this.formGroup.getRawValue(),
      updatedAt: Timestamp.now(),
    };

    if (!this.formGroup.valid) {
      this.snackBar.open('Форма не валідна виправіть помилки', 'Закрити', { duration: 3000 });
      return;
    }


    const clientsCollection = collection(this.firestore, 'admins');
    const q = query(clientsCollection, where('id', '==', this.user.id));
    const snapshot = await getDocs(q);

    try {
      if (snapshot.empty) {
        // Додаємо нового користувача, якщо його немає
        const newDocRef = doc(clientsCollection);
        await setDoc(newDocRef, payload);
        this.snackBar.open('Дані успішно додано', 'Закрити', { duration: 2000 });
      } else {
        // Оновлюємо існуючого користувача
        const docRef = snapshot.docs[0].ref;
        await updateDoc(docRef, payload);
        this.snackBar.open('Дані успішно оновлено', 'Закрити', { duration: 2000 });
      }
    } catch (error) {
      console.error('❌ Помилка оновлення:', error);
    }
  }

  async deleteUser(): Promise<void> {
    const userCollections = ['clients', 'calories', 'exercises', 'meals'];

    try {
      const deletePromises = userCollections.map(async (collectionName) => {
        const collectionRef = collection(this.firestore, collectionName);
        const q = query(collectionRef, where('id', '==', this.user.id));
        const snapshot = await getDocs(q);

        snapshot.forEach(async (docSnap) => {
          await deleteDoc(docSnap.ref);
        });
      });

      await Promise.all(deletePromises);
      this.snackBar.open('Користувача та всі залежні дані успішно видалено', 'Закрити', { duration: 2000 });
      this.router.navigate([`/users`]);

    } catch (error) {
      console.error('❌ Помилка видалення:', error);
    }
  }

}
