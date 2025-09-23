import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsersComponent } from './users.component';
import { UserDetailComponent } from './pages/user-detail/user-detail.component';
import { CreateUserComponent } from './pages/create-user/create-user.component';


const routes: Routes = [
  {
    path:'',
    component: UsersComponent,
  },
  {
    path:'create-user',
    component: CreateUserComponent,
  },
  {
    path:'user/:id',
    component: UserDetailComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule { }
