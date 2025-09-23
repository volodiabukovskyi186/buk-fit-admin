import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
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

  canActivate(): Observable<boolean> {
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
                this.router.navigate(['auth/login']);

              }
            })
          );
        }

        this.router.navigate(['auth/login']);
        return of(false);
      })
    );
  }
}
