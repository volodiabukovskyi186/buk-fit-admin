import {Component, OnDestroy, OnInit} from '@angular/core';
import {NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {AngularFireStorageModule} from '@angular/fire/compat/storage';
import { HttpClientModule } from '@angular/common/http';
import {BrowserModule} from '@angular/platform-browser';
import {CommonModule, NgIf} from '@angular/common';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {filter, Subscription} from 'rxjs';
import {AuthService} from './core/services/auth/auth.service';
import {USER_STATUS_ENUM} from './core/enums/users-status.enum';
import {UserInterface} from './core/interfaces/user.interface';

// BrowserAnimationsModule,
//   BrowserModule,
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    MatSnackBarModule,

  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'buk-fit-admin';

  private subscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {
  }



  ngOnInit(): void {
    this.getUserState();
    // this.checkTokenAndLogin();
    // this.checkToken();
  }

  // private checkToken(): void {
  //   const token = localStorage.getItem('token');
  //   console.log('token---->', token)
  // }


  ngOnDestroy(): void {
    this.getUserState();
  }


  private getUserState () {
    const stream$= this.authService.userState$.pipe().subscribe((user:UserInterface) => {

      if (user.status === USER_STATUS_ENUM.BLOCKED || user.status === USER_STATUS_ENUM.DELETED) {
        this.authService.logout();
        this.snackBar.open('Ваш акаунт заблоковано, зверніться до адміністратора')
        this.router.navigate(['/auth/login']);
      }

      if (user.status === USER_STATUS_ENUM.NEW) {
        this.router.navigate(['/welcome']);
      }

    });

    this.subscription.add(stream$);
  }
}
