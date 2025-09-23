import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HSButtonModule } from "../../core/components/button";
import { HSFormFieldModule } from "../../core/components/form-field";
import { HSInputModule } from "../../core/components/input";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors, ValidatorFn,
  Validators
} from "@angular/forms";
import { AdminsService } from "../../core/services/admins/admin.service";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../core/services/auth/auth.service";
import { Firestore, doc, setDoc, Timestamp } from '@angular/fire/firestore'; // ✅ Використовуємо новий Firestore API
import { USER_ROLES_ENUM } from "../../core/enums/users-roles.enum";
import { USER_STATUS_ENUM } from "../../core/enums/users-status.enum";
import { UserInterface } from "../../core/interfaces/user.interface";
import { TOKEN_ENUM } from "../../core/enums/token.enum";
import { catchError, Subscription, throwError } from "rxjs";
import { NgxMaskDirective } from "ngx-mask";
import {HSSelectModule} from '../../core/components/select/select.module';

@Component({
  selector: 'bk-register',
  standalone: true,
  imports: [CommonModule, HSButtonModule, HSFormFieldModule, HSInputModule, ReactiveFormsModule, RouterLink, NgxMaskDirective, HSSelectModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RegisterComponent implements OnInit, OnDestroy {
  registerForm: FormGroup;
  isEmailExists = false;
  UserRolesEnum = USER_ROLES_ENUM;
  private subscription: Subscription = new Subscription();

  constructor(
    private adminsService: AdminsService,
    private firestore: Firestore, // ✅ Використовуємо Firestore замість `AngularFirestore`
    private router: Router,
    private authService: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      name: this.fb.control('', Validators.required),
      secondName: this.fb.control('', Validators.required),
      role: this.fb.control(USER_ROLES_ENUM.TRAINER, Validators.required),
      phone: this.fb.control('+380', Validators.required),
      email: this.fb.control('', [Validators.required, Validators.email]),
      password: this.fb.control('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: this.fb.control('', Validators.required)
    }, { validators: this.passwordMatchValidator('password', 'confirmPassword') });
  }

  passwordMatchValidator(password: string, confirmPassword: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const passwordControl = control.get(password);
      const confirmPasswordControl = control.get(confirmPassword);

      if (!passwordControl || !confirmPasswordControl) {
        return null;
      }

      const passwordValue = passwordControl.value;
      const confirmPasswordValue = confirmPasswordControl.value;

      if (passwordValue !== confirmPasswordValue) {
        confirmPasswordControl.setErrors({ passwordMismatch: true });
        return { passwordMismatch: true };
      } else {
        if (confirmPasswordControl.hasError('passwordMismatch')) {
          confirmPasswordControl.setErrors(null);
        }
        return null;
      }
    };
  }

  register() {
    if (!this.registerForm.valid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const email = this.registerForm.get('email')?.value;
    const password = this.registerForm.get('password')?.value;

    const stream$ = this.authService.register(email, password).pipe(
      catchError((error: any) => {
        this.isEmailExists = true;
        return throwError(() => error);
      })
    ).subscribe((uid: string) => {
      this.login(uid);
    });

    this.subscription.add(stream$);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  async login(uid: string): Promise<void> {
    const email = this.registerForm.value.email;
    const password = this.registerForm.value.password;

    this.authService.login1(email, password).subscribe({
      next: (token: string) => {
        localStorage.setItem(TOKEN_ENUM, token);
        this.addUser(uid);
      },
      error: (error) => {
        console.error('Помилка входу:', error);
      }
    });
  }

  addUser(uid: string): void {
    const formValue = this.registerForm.value;

    const user: UserInterface = {
      id: uid,
      createdAt: Timestamp.now(),
      name: formValue.name,
      secondName: formValue.secondName,
      phone: formValue.phone,
      email: formValue.email,
      role: formValue.role,
      status: USER_STATUS_ENUM.NEW,
    };

    // const url = formValue.role ===  USER_ROLES_ENUM.MANAGER ?  'admins' : 'coaches';

    const userDocRef = doc(this.firestore,  `admins/${uid}`); // ✅ Правильний шлях для Firestore
    setDoc(userDocRef, user).then(() => {
      this.router.navigate(['/welcome']);
    }).catch(error => {
      console.error("Помилка при збереженні користувача:", error);
    });
  }
}
