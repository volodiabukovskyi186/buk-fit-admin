import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ExercisesComponent} from "./exercises.component";
import {CreateExerciseComponent} from "./pages/create-exercises/create-exercise.component";
import {EditExerciseComponent} from "./pages/edit-exercises/edit-exercise.component";

const routes: Routes = [
  {
    path:'',
    component:ExercisesComponent
  },
  {
    path:'create-exercise',
    component: CreateExerciseComponent
  },
  {
    path:'edit-exercise/:id',
    component: EditExerciseComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExercisesRoutingModule { }
