import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MainComponent } from './main.component';
import {IngredientsModule} from "./pages/ingredients/ingredients.module";
import {WelcomePageComponent} from './pages/welcome-page/welcome-page.component';
import {CoachProfileComponent} from './pages/profiles-info/coach-profile/coach-profile.component';
import {BotMessagesComponent} from './pages/bot-messages/message-detail.component';
import {ExpiringPaymentsComponent} from './pages/expiring-payments/expiring-payments.component';
import {
  ExpiringPaymentDetailComponent
} from './pages/expiring-payments/pages/expiring-payment-detail/expiring-payment-detail.component';
import {DeletedUsersRoutingModule} from './pages/deleted-users/deleted-users-routing.module';


const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      // {
      //   path: '',
      //   redirectTo: 'messages'
      // },
      // {
      //   path: '**',
      //   redirectTo: 'messages'
      // },
      // {
      //   path: 'client',
      //   loadChildren: () => import('./client/client.module').then((m) => m.ClientModule),
      // },
      {
        path: 'exercises',
        loadChildren: () => import('./pages/exercises/exercises.module').then((m) => m.ExercisesModule),
      },
      {
        path: 'exercises-home',
        loadChildren: () => import('./pages/exercises-home/exercises-home.module').then((m) => m.ExercisesHomeModule),
      },
      {
        path: 'meals',
        loadChildren: () => import('./pages/meals-names/meals-names.module').then((m) => m.MealsNamesModule),
      },
      {
        path: 'coaches',
        loadChildren: () => import('./pages/coaches/coaches.module').then((m) => m.CoachesModule),
      },
      {
        path: 'managers',
        loadChildren: () => import('./pages/managers/managers.module').then((m) => m.ManagersModule),
      },
      {
        path: 'video',
        loadChildren: () => import('./pages/exercises/exercises.module').then((m) => m.ExercisesModule),
      },
      {
        path: 'ingredients',
        loadChildren: () => import('./pages/ingredients/ingredients.module').then((m) => m.IngredientsModule),
      },
      {
        path: 'users',
        loadChildren: () => import('./pages/users/users.module').then((m) => m.UsersModule),
      },
      {
        path: 'deleted-users',
        loadChildren: () => import('./pages/deleted-users/deleted-users.module').then((m) => m.DeletedUsersModule),
      },
      {
        path: 'welcome-messages',
       component: BotMessagesComponent,
      },
      {
        path: 'welcome',
        component: WelcomePageComponent,
      },
      {
        path: 'coach-profile',
        component: CoachProfileComponent,
      },
      {
        path: 'users-payments',
        component: ExpiringPaymentsComponent,
      },
      {
        path: 'users-payments/user/:id',
        component: ExpiringPaymentDetailComponent,
      },
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule { }
