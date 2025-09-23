import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {RegisterComponent} from "./register/register.component";
import { LoginComponent } from './login/login.component';
import {ResetPasswordComponent} from "./reset-password/reset-password.component";

const routes: Routes = [
  // {
  //   path:'**',
  //   redirectTo:'/login',
  //   component: LoginComponent,
  // },
  {
    path:'login',
    component: LoginComponent,
  },
  {
    path:'reset-password',
    component: ResetPasswordComponent,
  },
  {
    path:'register',
    component: RegisterComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
