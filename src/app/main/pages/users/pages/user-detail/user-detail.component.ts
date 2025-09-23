import {HttpClient} from '@angular/common/http';
import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';

import {collection, Firestore, getDocs, query, where} from '@angular/fire/firestore';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ClientInterface, UserInterface} from '../../../../../core/interfaces/user.interface';
import {UsersService} from '../../users.service';
import {Subscription} from 'rxjs';
import {VTExercisesService} from '../../../../../core/services/exercises/exercises.service';
import {VTCoachesService} from '../../../../../core/services/coaches/coaches.service';
import {USER_STATUS_ENUM} from '../../../../../core/enums/users-status.enum';
import {USER_ROLES_ENUM} from '../../../../../core/enums/users-roles.enum';
import {AuthService} from '../../../../../core/services/auth/auth.service';

export enum USER_INFO_TABS_ENUM {
  EXESISES = 'EXESISES',
  MEAL = 'MEAL',
  MEAL_TEXT = 'MEAL_TEXT',
  CALORIES = 'CALORIES',
  INFO = 'INFO',
  PAYMENT = 'PAYMENT'
}

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss']
})
export class UserDetailComponent implements OnInit, OnDestroy {

  user: ClientInterface;
  admin: UserInterface;
  id: string;
  formGroup: FormGroup;
  selectedView = USER_INFO_TABS_ENUM.INFO;
  userInfoTabsEnum = USER_INFO_TABS_ENUM;
  userStatusEnum = USER_STATUS_ENUM;
  private subscription: Subscription = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private firestore: Firestore, // ✅ Новий Firestore API
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private fb: FormBuilder,
    private usersService: UsersService,
    private vtExercisesService: VTExercisesService,
    private vtCoachesService: VTCoachesService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    this.getUserById(this.id);

    this.getCoachesState();
    this.getIsUserUpdateState();

    this.getExercisesState();
    this.getExercisesHomeState();
    this.getAdminState();
  }

  private getAdminState(): void {
    const  stream$  = this.authService.userState$.subscribe((admin: UserInterface) => {
      this.admin = admin;
    });

    this.subscription.add(stream$);
  }

  setTabView(data: any): void {
    if (this.user.status === USER_STATUS_ENUM.NEW) {
      this.snackBar.open('Не можливо відкрити вкладку оськільки в користувача статус NEW');
      this.selectedView = USER_INFO_TABS_ENUM.INFO;
      return;
    }
    this.selectedView = data;
  }

  private getExercisesState(): void {
    const stream$ = this.vtExercisesService.userExerciseListState$.subscribe((exercises: any[]) => {
      if (!exercises.length) {
        this.getExercises();
      }
    });

    this.subscription.add(stream$);
  }

  private getExercisesHomeState(): void {
    const stream$ = this.vtExercisesService.userExerciseListState$.subscribe((exercises: any[]) => {
      if (!exercises.length) {
        this.getExercisesHome();
      }
    });

    this.subscription.add(stream$);
  }

  private getIsUserUpdateState(): void {
    const stream$ = this.usersService.userUpdatedState$.subscribe(() => {
      this.getUserById(this.id);
    });

    this.subscription.add(stream$);
  }

  private getExercises() {
    const stream$ = this.vtExercisesService.getExerciseNames().subscribe(exercises => {
      if (exercises.length) {
        this.vtExercisesService.setExercises(exercises);
      }
    });

    this.subscription.add(stream$);
  }

  private getExercisesHome() {
    const stream$ = this.vtExercisesService.getExerciseHomeNames().subscribe(exercises => {
      if (exercises.length) {
        this.vtExercisesService.setExercisesHome(exercises);
      }
    });

    this.subscription.add(stream$);
  }

  private getCoachesState(): void {
    const stream$ = this.vtCoachesService.userCoachesListState$.subscribe((coaches: any[]) => {

      if (!coaches.length) {
        this.getCoaches();
      }
    });

    this.subscription.add(stream$);
  }

  private getCoaches() {
    const stream$ = this.vtCoachesService.getCoaches().subscribe(coaches => {
      if (coaches.length) {
        this.vtCoachesService.setCoaches(coaches);
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

        this.cdr.detectChanges(); // ✅ Оновлюємо UI
      } else {
        console.warn("⚠️ Користувач не знайдений.");
      }
    } catch (error) {
      console.error("❌ Помилка отримання користувача:", error);
    }
  }


  protected readonly userRoleEnum = USER_ROLES_ENUM;
}
