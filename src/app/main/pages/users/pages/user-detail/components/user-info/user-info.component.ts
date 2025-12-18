import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
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
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {USER_ROLES_ENUM} from '../../../../../../../core/enums/users-roles.enum';
import {USER_STATUS_ENUM} from '../../../../../../../core/enums/users-status.enum';
import {VTExercisesService} from '../../../../../../../core/services/exercises/exercises.service';
import {VTCoachesService} from '../../../../../../../core/services/coaches/coaches.service';
import {ClientInterface, UserInterface} from '../../../../../../../core/interfaces/user.interface';
import {AuthService} from '../../../../../../../core/services/auth/auth.service';
import {BKCheckPaymentDateService} from '../../../../../../../core/services/date/check-payment-date.service';
import {PAYMENT_DATE_ENUM} from '../../../../../../../core/enums/payment-date/payment-date.enum';
import {UsersService} from '../../../../users.service';
import {TRAINING_TYPE_ENUM} from '../../../../../../../core/enums/training-type.enum';

@Component({
  selector: 'bk-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.scss']
})
export class UserInfoComponent implements OnInit, OnDestroy {
  userStatusEnum = USER_STATUS_ENUM;
  user: ClientInterface;
  id: string;
  formGroup: FormGroup;
  coaches: UserInterface[] = [];
  admin: UserInterface;
  paymentTimeType: PAYMENT_DATE_ENUM;

  paymentDateEnum = PAYMENT_DATE_ENUM;
  trainingTypeEnum = TRAINING_TYPE_ENUM;
  private subscription: Subscription = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private firestore: Firestore, // ✅ Новий Firestore API
    private cdr: ChangeDetectorRef,
    private vtExercisesService: VTExercisesService,
    private bkCheckPaymentDateService: BKCheckPaymentDateService,
    private vtCoachesService: VTCoachesService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private usersService: UsersService,
    private router: Router,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.getCoachesState();
    this.id = this.route.snapshot.params['id'];

    this.formGroup = this.fb.group({
      name: this.fb.control(null, Validators.required),
      secondName: this.fb.control(null, Validators.required),
      status: this.fb.control(null, Validators.required),
      role: this.fb.control(null, Validators.required),
      phone: this.fb.control(null, Validators.required),
      email: this.fb.control(null, Validators.required),
      createdAt: this.fb.control(null, Validators.required),
      payDate: this.fb.control(null),
      updatedAt: this.fb.control(null),
      coachId: this.fb.control(null),
      id: this.fb.control(null, Validators.required),
      weight: this.fb.control(null),
      calories: this.fb.control(null),
      proteins: this.fb.control(null),
      fats: this.fb.control(null),
      carbohydrates: this.fb.control(null),
      trainingType: this.fb.control(TRAINING_TYPE_ENUM.GYM, Validators.required),
    });

    this.formGroup.get('id').disable();
    this.formGroup.get('email').disable();

    this.getUserState();
    this.getUserById(this.id);
  }

  moveToTg(tgUser: any) {
    window.open(`https://t.me/${tgUser.username}`);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private getUserState(): void {
    const stream$ = this.authService.userState$.subscribe((user: UserInterface) => {
      this.admin = user;
      if (user.role === USER_ROLES_ENUM.TRAINER) {
        console.log('ADMIN===', user)
        this.formGroup.get('coachId').disable();
      }
    });

    this.subscription.add(stream$);
  }

  private getCoachesState(): void {
    const stream$ = this.vtCoachesService.userCoachesListState$.subscribe((coaches: any[]) => {

      if (coaches.length) {
        this.coaches = coaches;
      }
    });

    this.subscription.add(stream$);
  }


  async getUserById(id: string): Promise<void> {
    const clientsCollection = collection(this.firestore, 'clients');
    const q = query(clientsCollection, where('id', '==', id));

    try {
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        this.user = (snapshot.docs[0].data() as ClientInterface);

        this.formGroup.patchValue(this.user);

        if (this.user?.payDate?.seconds) {
          this.paymentTimeType = this.bkCheckPaymentDateService.checkPaymentDate(this.user.payDate);

          const payDate = new Date(this.user.payDate.seconds * 1000);
          this.formGroup.get('payDate').setValue(payDate);

        }

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

      if(!this.formGroup.get('coachId').valid) {
        this.snackBar.open('Поле тренер обовязкове до заповнення', 'Закрити', { duration: 3000 });
        this.formGroup.get('coachId')?.setErrors({ required: true });
      } else {
        this.snackBar.open('Форма не валідна виправіть помилки', 'Закрити', { duration: 3000 });
      }
      return;
    }


    const clientsCollection = collection(this.firestore, 'clients');
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
        this.usersService.userUpdated();
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

  protected readonly UserRolesEnum = USER_ROLES_ENUM;
}
