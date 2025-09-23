import {HttpClient} from '@angular/common/http';
import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';

import {collection, Firestore, getDocs, query, where} from '@angular/fire/firestore';
import {MatSnackBar} from '@angular/material/snack-bar';
import {UserInterface} from '../../../../../core/interfaces/user.interface';
import {ManagersService} from '../../managers.service';
import {Subscription} from 'rxjs';
import {VTExercisesService} from '../../../../../core/services/exercises/exercises.service';

export enum USER_INFO_TABS_ENUM {
  CLIENTS = 'CLIENTS',
  MEAL = 'MEAL',
  MEAL_TEXT = 'MEAL_TEXT',
  CALORIES = 'CALORIES',
  INFO = 'INFO'
}

@Component({
  selector: 'app-manager-detail',
  templateUrl: './manager-detail.component.html',
  styleUrls: ['./manager-detail.component.scss']
})
export class ManagerDetailComponent implements OnInit, OnDestroy {

  user: UserInterface;
  id: string;
  formGroup: FormGroup;
  selectedView = USER_INFO_TABS_ENUM.INFO;
  userInfoTabsEnum = USER_INFO_TABS_ENUM;
  private subscription: Subscription = new Subscription();

  constructor(
    private snackBar: MatSnackBar,
    private firestore: Firestore, // ✅ Новий Firestore API
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private fb: FormBuilder,
    private usersService: ManagersService,
    private vtExercisesService: VTExercisesService,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    this.getUserById(this.id);
    // this.getExercisesState();
  }

  setTabView(data: any): void {
    this.selectedView = data;
  }

  // private getExercisesState(): void {
  //   const stream$ = this.vtExercisesService.userExerciseListState$.subscribe((exercises: any[]) => {
  //     if (!exercises.length) {
  //       this.getExercises();
  //     }
  //   });
  //
  //   this.subscription.add(stream$);
  // }
  //
  // private getExercises() {
  //   const stream$ = this.vtExercisesService.getExerciseNames().subscribe(exercises => {
  //     if(exercises.length) {
  //       this.vtExercisesService.setExercises(exercises);
  //     }
  //   });
  //
  //   this.subscription.add(stream$);
  // }

  async getUserById(id: string): Promise<void> {
    const clientsCollection = collection(this.firestore, 'admins');
    const q = query(clientsCollection, where('id', '==', id));

    try {
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        this.user = (snapshot.docs[0].data() as UserInterface);

        this.cdr.detectChanges(); // ✅ Оновлюємо UI
      } else {
        console.warn("⚠️ Користувач не знайдений.");
      }
    } catch (error) {
      console.error("❌ Помилка отримання користувача:", error);
    }
  }


}
