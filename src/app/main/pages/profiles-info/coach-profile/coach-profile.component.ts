import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {HSButtonModule} from "../../../../core/components/button";
import {HSFormFieldModule} from "../../../../core/components/form-field";
import {HSInputModule} from "../../../../core/components/input";
import {HSSelectModule} from "../../../../core/components/select/select.module";
import {IQCheckboxModule} from "../../../../core/components/checkbox";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {USER_STATUS_ENUM} from '../../../../core/enums/users-status.enum';
import {MatSnackBar} from '@angular/material/snack-bar';
import {
  collection,
  deleteDoc,
  doc,
  Firestore,
  getDocs,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where
} from '@angular/fire/firestore';
import {ActivatedRoute, Router} from '@angular/router';
import {UserInterface} from '../../../../core/interfaces/user.interface';
import {AuthService} from '../../../../core/services/auth/auth.service';

@Component({
  selector: 'app-coach-profile',
  standalone: true,
    imports: [
        HSButtonModule,
        HSFormFieldModule,
        HSInputModule,
        HSSelectModule,
        IQCheckboxModule,
        ReactiveFormsModule
    ],
  templateUrl: './coach-profile.component.html',
  styleUrl: './coach-profile.component.scss'
})
export class CoachProfileComponent implements OnInit {
  userStatusEnum = USER_STATUS_ENUM;
  user: any;
  id: string;
  formGroup: FormGroup;

  constructor(
    private snackBar: MatSnackBar,
    private firestore: Firestore, // ✅ Новий Firestore API
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    // this.id = this.route.snapshot.params['id'];

    this.formGroup = this.fb.group({
      name: this.fb.control(null, Validators.required),
      secondName: this.fb.control(null, Validators.required),
      status: this.fb.control(null, Validators.required),
      role: this.fb.control(null, Validators.required),
      phone: this.fb.control(null, Validators.required),
      email: this.fb.control(null, Validators.required),
      createdAt: this.fb.control(null, Validators.required),
      updatedAt: this.fb.control(null),
      openToClients: this.fb.control(null),
      id: this.fb.control(null, Validators.required),
    });

    this.formGroup.get('id').disable();
    this.formGroup.get('email').disable();
    this.getUserState();
  }

  private getUserState () {
    const stream$= this.authService.userState$.pipe().subscribe((user:UserInterface) => {
      this.id = user.id;
      this.getUserById(this.id);
    });

    // this.subscription.add(stream$);
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
