import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {environment} from '../environments/environment';
import {provideFirebaseApp} from '@angular/fire/app';
import {provideAuth} from '@angular/fire/auth';
import {initializeApp} from 'firebase/app';
import {getAuth} from 'firebase/auth';
import {getStorage, provideStorage} from '@angular/fire/storage';
import {getFirestore, provideFirestore} from '@angular/fire/firestore';
import {HttpClientModule, provideHttpClient} from '@angular/common/http';
import {provideAnimations} from '@angular/platform-browser/animations';
import {MAT_SNACK_BAR_DEFAULT_OPTIONS} from '@angular/material/snack-bar';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatDateFormats} from '@angular/material/core';
import {MAT_DATEPICKER_SCROLL_STRATEGY, MatDatepickerModule} from '@angular/material/datepicker';
import {MomentDateAdapter} from '@angular/material-moment-adapter';


// export const MY_FORMATS = {
//   parse: {
//     dateInput: 'LL'
//   },
//   display: {
//     dateInput: 'YYYY-MM-DD',
//     monthYearLabel: 'YYYY',
//     dateA11yLabel: 'LL',
//     monthYearA11yLabel: 'YYYY'
//   }
// };

export const CUSTOM_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: 'DD-MM-YYYY',
  },
  display: {
    dateInput: 'DD-MM-YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'DD-MM-YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    { provide: MatDatepickerModule, useClass: MatDatepickerModule },
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(), // ✅ Додаємо An
    provideFirebaseApp(() => {
      let app: any;
      app = initializeApp(environment.firebase);

      return app;
    }),
    provideAuth(() => {
      const auth = getAuth();

      return auth;
    }),
    provideStorage(() => {
      const storage = getStorage();
      console.log('✅ Firebase Storage отримано:', storage);
      return storage;
    }),
    provideFirestore(() => {
      return getFirestore();
    }),
    provideHttpClient(),
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: {
        duration: 5000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      },
    },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
  ]
};
