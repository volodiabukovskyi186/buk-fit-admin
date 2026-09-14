import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import {Observable, of, from, catchError} from 'rxjs';

import { switchMap, tap } from 'rxjs/operators';
import { getAuth, signInWithCustomToken, onAuthStateChanged, User } from 'firebase/auth';
import {AuthService} from "../services/auth/auth.service";
import {TOKEN_ENUM} from '../enums/token.enum';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    // куди користувач намагався потрапити — щоб повернути його туди після входу
    // (посилання з Telegram ведуть одразу на картку клієнта)
    const returnUrl = state?.url && !state.url.startsWith('/auth') ? state.url : null;
    const goToLogin = () => this.router.navigate(
      ['auth/login'],
      returnUrl ? {queryParams: {returnUrl}} : {},
    );

    return this.authService.isLoggedIn().pipe(
      switchMap((isLoggedIn) => {
        if (isLoggedIn) {
          return of(true);
        }

        const token = localStorage.getItem(TOKEN_ENUM);
        if (token) {
          const auth = getAuth();
          return from(signInWithCustomToken(auth, token)).pipe(
            catchError(err => {
              localStorage.removeItem(TOKEN_ENUM);

              return of(false);
            }),
            switchMap((userCredential: any) => {
              if (userCredential) {
                this.authService.getUserById(userCredential.user.uid);
              }
              return of(!!userCredential.user);
            }),
            tap((success) => {

              if (!success) {
                localStorage.removeItem('token');
                goToLogin();
              }
            })
          );
        }

        goToLogin();
        return of(false);
      })
    );
  }
}
