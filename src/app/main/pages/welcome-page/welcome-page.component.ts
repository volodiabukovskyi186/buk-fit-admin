import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';

import {CommonModule} from "@angular/common";

import {filter, Subscription} from "rxjs";

import {MatSnackBar} from "@angular/material/snack-bar";
import {Router} from "@angular/router";
import {UserInterface} from '../../../core/interfaces/user.interface';
import {AuthService} from '../../../core/services/auth/auth.service';
import {USER_STATUS_ENUM} from '../../../core/enums/users-status.enum';

@Component({
  selector: 'hs-welcome-page',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './welcome-page.component.html',
  styleUrls: ['./welcome-page.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class WelcomePageComponent implements OnInit, OnDestroy {
  user: UserInterface
  userStatusEnum = USER_STATUS_ENUM;
  private subscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    this.checkIsLoggedIn();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private checkIsLoggedIn() {
    const stream$ = this.authService.userState$.pipe(filter((user: UserInterface | null) => user !== null)).subscribe((user: UserInterface) => {
      this.user = user;

      if (this.user.status !== USER_STATUS_ENUM.NEW &&this.user.status !== USER_STATUS_ENUM.DELETED &&this.user.status !== USER_STATUS_ENUM.BLOCKED ) {
        this.router.navigate(['/users']);
      }

    });

    this.subscription.add(stream$);
  }
}
