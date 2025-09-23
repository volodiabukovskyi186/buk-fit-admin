import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {MealsNamesComponent} from "./meals-names.component";
import {CreateMealsNamesComponent} from './pages/create-meals-names/create-meals-names.component';
import {EditMealsNameComponent} from './pages/edit-meals-names/edit-exercise-home.component';


const routes: Routes = [
  {
    path:'',
    component:MealsNamesComponent
  },
  {
    path:'create-meals',
    component: CreateMealsNamesComponent
  },
  {
    path:'edit-meals/:id',
    component: EditMealsNameComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MealsNamesRoutingModule { }
