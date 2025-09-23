import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ExercisesHomeComponent} from "./exercises-home.component";
import {CreateExerciseHomeComponent} from "./pages/create-exercises-home/create-exercise-home.component";
import {EditExerciseHomeComponent} from "./pages/edit-exercises-home/edit-exercise-home.component";

const routes: Routes = [
  {
    path:'',
    component:ExercisesHomeComponent
  },
  {
    path:'create-exercise',
    component: CreateExerciseHomeComponent
  },
  {
    path:'edit-exercise/:id',
    component: EditExerciseHomeComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExercisesHomeRoutingModule { }
