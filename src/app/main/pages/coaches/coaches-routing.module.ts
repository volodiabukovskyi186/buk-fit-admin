import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CoachesComponent } from './coaches.component';
import { CoachDetailComponent } from './pages/coach-detail/coach-detail.component';


const routes: Routes = [
  {
    path:'',
    component: CoachesComponent,
  },
  {
    path:'coach/:id',
    component: CoachDetailComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CoachesRoutingModule { }
