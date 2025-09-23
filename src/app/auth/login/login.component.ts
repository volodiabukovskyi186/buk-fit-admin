import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {Firestore} from '@angular/fire/firestore'; // ✅ Замінено `AngularFirestore`
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {catchError, Subscription} from 'rxjs';
import {AdminsService} from 'src/app/core/services/admins/admin.service';
import {AuthService} from '../../core/services/auth/auth.service';
import {TOKEN_ENUM} from '../../core/enums/token.enum';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'bk-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  isErrorAuth = false;
  private subscription: Subscription = new Subscription();

  constructor(
    private adminsService: AdminsService,
    private firestore: Firestore, // ✅ Використовуємо новий Firestore API
    private snackBar: MatSnackBar,
    private router: Router,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
  }


  ngOnInit(): void {
    this.checkIsLoggedIn();
    this.loginForm = this.fb.group({
      email: this.fb.control('', Validators.required),
      password: this.fb.control('', Validators.required)
    });

    const admin = localStorage.getItem('admin');

    if (admin) {
      this.loginForm.patchValue(JSON.parse(admin));
      this.login();
    }
  }


  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  checkIsLoggedIn() {
    // const stream$ = this.authService.userFirebase$.pipe(filter((user: User) => user !== null)).subscribe(() => {
    //   this.router.navigate(['/users']);
    // });

    // this.subscription.add(stream$);
  }

  login() {
    if (!this.loginForm.valid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const password = this.loginForm.get('password')?.value;
    const email = this.loginForm.get('email')?.value;

    const stream$ = this.authService.login(email, password).pipe(
      catchError((error: any) => {
        this.snackBar.open(error)
        return error
      })
    ).subscribe((token: string) => {

      console.log('Отримано токен:', token);
      localStorage.setItem(TOKEN_ENUM, token);
      this.router.navigate(['/users']);
    });


    this.subscription.add(stream$);
  }
}
