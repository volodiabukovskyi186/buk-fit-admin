import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManagersComponent } from './managers.component';
import { ManagerDetailComponent } from './pages/manager-detail/manager-detail.component';


const routes: Routes = [
  {
    path:'',
    component: ManagersComponent,
  },
  {
    path:'manager/:id',
    component: ManagerDetailComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManagersRoutingModule { }
