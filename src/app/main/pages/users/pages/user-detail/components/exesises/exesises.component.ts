import {HttpClient} from '@angular/common/http';
import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {collection, doc, Firestore, getDocs, query, setDoc, updateDoc, where} from '@angular/fire/firestore';
import {MatSnackBar} from '@angular/material/snack-bar';
import {forkJoin} from 'rxjs';
import {VTExercisesService} from 'src/app/core/services/exercises/exercises.service';
import {filter, Subscription} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import {UsersService} from '../../../../users.service';
import {environment} from 'src/environments/environment';
import {ConfirmDialogComponent} from 'src/app/core/dialogs/confirm-dialog/confirm-dialog.component';
import {ClientInterface} from 'src/app/core/interfaces/user.interface';
import {TRAINING_TYPE_ENUM} from 'src/app/core/enums/training-type.enum';
import {BKExercisesHelperService} from 'src/app/core/services/exercises/exercises-helper.service';

@Component({
  selector: 'bk-exercises-main',
  templateUrl: './exesises.component.html',
  styleUrls: ['./exesises.component.scss']
})
export class ExesisesComponent implements OnInit, OnDestroy {
  user: ClientInterface;
  id: string;
  formGroup: FormGroup;
  exersiceNames = [];

  lastVisible: any = null;
  restsTimeOptions = [];
  weightOptions = [];
  repeatCountsOptions = [];
  activeDay: number = 0;
  private subscription: Subscription = new Subscription();

  constructor(
    private bkExercisesHelperService: BKExercisesHelperService,
    private snackBar: MatSnackBar,
    private firestore: Firestore, // ✅ Новий Firestore API
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private vtExercisesService: VTExercisesService,
    private usersService: UsersService,
    private dialog: MatDialog,
    private fb: FormBuilder,
  ) {
  }


  ngOnInit(): void {
    this.getExercisesRestTimes();
    // this.getExercisesState();
    // this.getExercisesHomeState();

    this.id = this.route.snapshot.params['id'];
    this.getUserById(this.id);

    this.formGroup = this.fb.group({
      days: this.fb.array([])
    });
  }

  private getExercisesRestTimes() {
    this.restsTimeOptions = this.bkExercisesHelperService.getRestsTime();
    this.weightOptions = this.bkExercisesHelperService.getWeights();
    this.repeatCountsOptions = this.bkExercisesHelperService.getRepeatCounts();
  }

  get days() {
    return this.formGroup.get('days') as FormArray;
  }

  addDay() {
    const dayGroup = this.fb.group({
      exercises: this.fb.array([])
    });
    this.days.push(dayGroup);
    this.activeDay = this.days.length - 1;
  }

  removeDay(index: number) {
    this.days.removeAt(index);
    this.activeDay = Math.min(this.activeDay, this.days.length - 1);
  }

  addExercise(dayIndex: number) {
    const exerciseGroup = this.fb.group({
      exerciseName: ['', Validators.required],
      setsAndReps: ['', Validators.required],
      weight: ['', Validators.required],
      comment: ['', Validators.required],
      restTime: ['', Validators.required],
      videoURL: ['', Validators.required],
      url: [''],
    });

    (this.days.at(dayIndex).get('exercises') as FormArray).push(exerciseGroup);
  }

  removeExercise(dayIndex: number, exerciseIndex: number) {
    (this.days.at(dayIndex).get('exercises') as FormArray).removeAt(exerciseIndex);
  }

  async getUserExercises(): Promise<void> {
    try {
      const collectionRef = collection(this.firestore, 'exercises');
      const q = query(collectionRef, where('id', '==', this.user.id));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        console.log('⚠️ Вправи не знайдено.');
      } else {
        const userData: any = snapshot.docs[0].data();
        console.log('✅ Отримані вправи:', userData);

        this.days.clear();
        userData.days.forEach((day: any) => {
          const dayGroup = this.fb.group({
            exercises: this.fb.array([])
          });

          day.exercises.forEach((exercise: any) => {
            const exerciseGroup = this.fb.group({
              exerciseName: [exercise.exerciseName, Validators.required],
              setsAndReps: [exercise.setsAndReps, Validators.required],
              weight: [exercise.weight, Validators.required],
              comment: [exercise.comment, Validators.required],
              restTime: [exercise.restTime, Validators.required],
              videoURL: [exercise.videoURL, Validators.required],
              url: [exercise?.url  ? exercise?.url : null, Validators.required],
            });

            (dayGroup.get('exercises') as FormArray).push(exerciseGroup);
          });

          this.days.push(dayGroup);
        });

        console.log('📌 Форма оновлена:', this.formGroup.value);
      }
    } catch (error) {
      console.error("❌ Помилка отримання вправ:", error);
    }
  }

  async updateExercise(): Promise<void> {
    try {
      if (this.days.length === 0) {
        this.snackBar.open('⚠️ Додайте хоча б один день!', 'Закрити', {duration: 2000});
        return;
      }

      const payload = {
        id: this.user.id,
        days: this.formGroup.value.days
      };

      console.log('📌 Оновлення користувача:', payload);

      const collectionRef = collection(this.firestore, 'exercises');
      const q = query(collectionRef, where('id', '==', this.user.id));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        // Якщо запису немає — додаємо
        const newDocRef = doc(collectionRef);
        await setDoc(newDocRef, payload);
        this.snackBar.open('✅ Дані додано', 'Закрити', {duration: 2000});
      } else {
        // Якщо запис є — оновлюємо
        const docRef = snapshot.docs[0].ref;
        await updateDoc(docRef, payload);
        this.snackBar.open('✅ Дані оновлено', 'Закрити', {duration: 2000});
      }

      await this.updateClientProgramUpdatedAt();
    } catch (error) {
      console.error("❌ Помилка оновлення:", error);
    }
  }

  private async updateClientProgramUpdatedAt(): Promise<void> {
    try {
      const clientsCollection = collection(this.firestore, 'clients');
      const q = query(clientsCollection, where('id', '==', this.user.id));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const clientDocRef = snapshot.docs[0].ref;
        await updateDoc(clientDocRef, {programUpdatedAt: new Date().toISOString()});
      }
    } catch (error) {
      console.error("❌ Помилка оновлення поля programUpdatedAt:", error);
    }
  }

  async getUserById(id: string): Promise<void> {
    try {
      const clientsCollection = collection(this.firestore, 'clients');
      const q = query(clientsCollection, where('id', '==', id));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        this.user = (snapshot.docs[0].data() as any);


        this.getExercises();
        await this.getUserExercises();
      } else {
        console.warn("⚠️ Користувач не знайдений.");
      }
    } catch (error) {
      console.error("❌ Помилка отримання користувача:", error);
    }
  }

  selectExesise(data: any, control) {
    console.log('📌 Вибір вправи:', data, control);
    control.get('comment').setValue(data.comment);
    control.get('videoURL').setValue(data.videoURL);
    control.get('url').setValue(data?.url);
  }

  selectExesiseRestTime(data: any, control) {
    control.get('restTime').setValue(data);
  }

  selectWeightTime(data: any, control) {
    control.get('weight').setValue(data);
  }

  selectRepeat(data: any, control) {
    control.get('setsAndReps').setValue(data);
  }


  async onSubmit(): Promise<void> {
    try {
      await this.updateExercise();
      this.snackBar.open('✅ Дані успішно збережено!', 'Закрити', {duration: 2000});
      this.router.navigate(['/exercises']);
    } catch (error) {
      console.error("❌ Помилка при збереженні:", error);
      this.snackBar.open('❌ Помилка збереження', 'Закрити', {duration: 2000});
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  // private getExercisesState(): void {
  //   const stream$ = this.vtExercisesService.userExerciseListState$.subscribe((exercises: any[]) => {
  //
  //     if (exercises.length) {
  //       this.gymExercises = [...exercises];
  //     }
  //   });
  //
  //   this.subscription.add(stream$);
  // }
  //
  // private getExercisesHomeState(): void {
  //   const stream$ = this.vtExercisesService.userExerciseHomeListState$.subscribe((exercises: any[]) => {
  //
  //     if (exercises.length) {
  //       this.homeExercises = [...exercises];
  //     }
  //   });
  //
  //   this.subscription.add(stream$);
  // }


  botUpdateExesice() {

    this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      height: '200px',
      data: {
        title: 'Увага!',
        text: `Ви справді хочете надіслати повідомлення про оновлення вправ користувачеві ${this.user.name}?`
      }
    }).afterClosed().pipe(filter(Boolean)).subscribe(data => {
      this.sendMessage();
    });
  }

 clearAllExercises() {
    this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      height: '200px',
      data: {
        title: 'Увага!',
        text: `Ви справді хочете очистити всі дні?`
      }
    }).afterClosed().pipe(filter(Boolean)).subscribe(data => {
      const exercises = this.formGroup.get('days') as FormArray;
      exercises.clear();
    });
  }

  private botToken = environment.clientBUKBotToken;

  sendMessage(): any {
    const chatId = this.user.tgUser.id;
    let apiUrl = `https://api.telegram.org/bot${this.botToken}/sendMessage`;


    const formData: FormData = new FormData();
    const message = `
<b>Привіт, ${this.user.name}! 👋</b>\n
📢 <b>Ми оновили вам тренування!</b>\n
🔥 Переглянь нові вправи та продовжуй удосконалювати своє тіло!
  `;
    formData.append('text', message)
    formData.append('parse_mode', 'html');
    const reply_markup = {
      inline_keyboard : [
        [{
          text: 'Перейти в додаток',
          web_app: { url: environment.miniAppLink },
        }]
      ]
    }

    formData.append('reply_markup', JSON.stringify(reply_markup));

    formData.append('chat_id', (chatId as any));
    this.usersService.sendMessage(apiUrl, formData).subscribe((response: any) => {
      console.log('response', response);
      this.snackBar.open('Ви успішно надіслали повідомлення в бот про оновлення вправ', 'Закрити', {duration: 2000});
    })
  }


  moveToTG(videoURL: string) {
    window.open(videoURL)
  }

  private getExercises() {
      const gymExercise$ = this.vtExercisesService.getExerciseNames();
      const homeExercise$ = this.vtExercisesService.getExerciseHomeNames();


    const stream$ = forkJoin({gymExercise: gymExercise$, homeExercise: homeExercise$}).subscribe(data => {
        if (this.user.trainingType === TRAINING_TYPE_ENUM.HOME) {
          this.exersiceNames = [...data.homeExercise, ...data.gymExercise];
        } else {
          this.exersiceNames = [...data.gymExercise, ...data.homeExercise];
        }

    })

    this.subscription.add(stream$);

  }


}
