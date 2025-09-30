import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation
} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgIf} from '@angular/common';
import {filter, Subscription} from 'rxjs';
import {
  addDoc,
  collection,
  collectionData,
  doc,
  Firestore,
  getDocs,
  query,
  updateDoc,
  where
} from '@angular/fire/firestore';
import {MatSnackBar} from '@angular/material/snack-bar';
import {HSFormFieldModule} from '../../../../../../../../../core/components/form-field';
import {HSSelectModule} from '../../../../../../../../../core/components/select/select.module';
import {HSInputModule} from '../../../../../../../../../core/components/input';
import {IQCheckboxModule} from '../../../../../../../../../core/components/checkbox';
import {HSButtonModule} from '../../../../../../../../../core/components/button';
import {AuthService} from '../../../../../../../../../core/services/auth/auth.service';
import {GENDER_ENUM} from '../../../../../../../../../core/enums/gender.enum';
import {ClientInterface} from '../../../../../../../../../core/interfaces/user.interface';
import {ActivatedRoute} from '@angular/router';
import {TRAINING_EXPERIENCE_ENUM} from '../../../../../../../../../core/enums/training-experiance.enum';
import {TRAINING_TYPE_ENUM} from '../../../../../../../../../core/enums/training-type.enum';
import {ConfirmDialogComponent} from '../../../../../../../../../core/dialogs/confirm-dialog/confirm-dialog.component';
import {environment} from '../../../../../../../../../../environments/environment';
import {UsersService} from '../../../../../../users.service';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';

@Component({
  selector: 'bk-user-survey',
  templateUrl: './user-survey.component.html',
  styleUrls: ['./user-survey.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HSFormFieldModule,
    HSInputModule,
    ReactiveFormsModule,
    IQCheckboxModule,
    HSSelectModule,
    NgIf,
    HSButtonModule,
    MatDialogModule,
  ]
})
export class UserSurveyComponent implements OnInit, OnDestroy {
  @Output() valueChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  currentUserId: string;
  formGroup: FormGroup;
  genderEnum = GENDER_ENUM;
  id: string;
  user: ClientInterface;

  trainingExperienceEnum = TRAINING_EXPERIENCE_ENUM;
  trainingTypeEnum = TRAINING_TYPE_ENUM;

  private subscription: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private firestore: Firestore,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this.initForm();
    //
    this.listenForm();
    this.id = this.route.snapshot.params['id'];
    this.getUserById(this.id);
  }

  async getUserById(id: string): Promise<void> {
    const clientsCollection = collection(this.firestore, 'clients');
    const q = query(clientsCollection, where('id', '==', id));

    try {
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        this.user = (snapshot.docs[0].data() as ClientInterface);

        this.currentUserId = this.user.id;
        this.getSurveyData();


        this.cdr.detectChanges();
      } else {
        console.warn("⚠️ Користувач не знайдений.");
      }
    } catch (error) {
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private initForm() {
    this.formGroup = this.fb.group({
      gender: [GENDER_ENUM.MEN, Validators.required],
      goal: ['', Validators.required],
      age: [null, [Validators.min(0)]],
      height: [null, [Validators.min(0)]],
      measurements: this.fb.group({
        weight: [null, [Validators.min(0)]],
        waist: [null, [Validators.min(0)]],
        hip: [null, [Validators.min(0)]],
        arm: [null, [Validators.min(0)]],
        chest: [null, [Validators.min(0)]],
        shoulders: [null, [Validators.min(0)]]
      }),
      stressLevel: [null, [Validators.min(1), Validators.max(10)]],
      activityLevel: [null, [Validators.min(1), Validators.max(10)]],
      intolerances: [''],
      healthStatus: [''],
      training: this.fb.group({
        frequencyPerWeek: [null, [Validators.min(0)]],
        type: [null],
        place: [null],
        trainingExperience: [null],
      }),
      breastfeeding: [false]
    });
  }

  private listenForm(): void {
    const stream$ = this.formGroup.valueChanges.subscribe((value: any) => {
      this.valueChange.emit(value);
    });

    this.subscription.add(stream$);
  }

  get genderControl(): AbstractControl {
    return this.formGroup.get('gender');
  }

  getSurveyData(): void {
    const q = query(
      collection(this.firestore, 'user-survey'),
      where('id', '==', this.currentUserId)
    );

    collectionData(q, {idField: 'docId'}).subscribe((survey: any[]) => {
      if (survey.length > 0) {
        this.formGroup.patchValue(survey[0]);
      }
    });
  }

  async updateUserSurvey() {
    if (this.formGroup.invalid || !this.currentUserId) {
      this.formGroup.markAllAsTouched();
      this.snackBar.open('Ви не вірно заповнили форму, перевірте поля', 'Закрити', {duration: 2000});
      return;
    }

    const payload = {
      ...this.formGroup.value,
      id: this.currentUserId,
      createdAt: new Date()
    };

    const q = query(
      collection(this.firestore, 'user-survey'),
      where('id', '==', this.currentUserId)
    );

    const snapshot = await getDocs(q);

    try {
      if (snapshot.empty) {
        await addDoc(collection(this.firestore, 'user-survey'), payload);
        this.snackBar.open('Анкету додано успішно', 'Закрити', {duration: 2000});
      } else {
        const docRef = doc(this.firestore, 'user-survey', snapshot.docs[0].id);
        await updateDoc(docRef, payload);
        this.snackBar.open('Анкету оновлено успішно', 'Закрити', {duration: 2000});
      }
    } catch (error) {
      console.error('❌ Помилка збереження анкети:', error);
      this.snackBar.open('Помилка при збереженні', 'Закрити', {duration: 2000});
    }
  }

  botSendMessageSunvery() {
    this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      height: '200px',
      data: {
        title: 'Увага!',
        text: `Ви справді хочете надіслати повідомлення про те щоб користувач оновив свої анкетні дані ${this.user.name}?`
      }
    }).afterClosed().pipe(filter(Boolean)).subscribe(data => {
      this.sendMessage();
    });
  }

  private botToken = environment.clientBUKBotToken;

  sendMessage(): any {
    const chatId = this.user.tgUser.id;
    let apiUrl = `https://api.telegram.org/bot${this.botToken}/sendMessage`;


    const formData: FormData = new FormData();
    const message = `
<b>${this.user.name}! 👋</b>\n
📢 <b>Ми помітили, що твоя анкета ще не заповнена.</b>\n
🔥 Будь ласка, заповни її — це допоможе нам краще підготувати індивідуальний план саме для тебе!
`;

    formData.append('text', message)
    formData.append('parse_mode', 'html');
    const reply_markup = {
      inline_keyboard: [
        [{
          text: 'Перейти до заповнення анкети',
          web_app: {url:  `${environment.miniAppLink}/client/user-profile`},
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

  get trainingExperienceControl(): AbstractControl {
    return this.formGroup.get('training').get('trainingExperience')
  }
}
