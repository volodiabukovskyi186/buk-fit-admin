import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DeletedUsersComponent } from './deleted-users.component';
import {UserDetailComponent} from '../users/pages/user-detail/user-detail.component';


const routes: Routes = [
  {
    path:'',
    component: DeletedUsersComponent,
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
export class DeletedUsersRoutingModule { }
