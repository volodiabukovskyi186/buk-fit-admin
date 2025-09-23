
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {IngredientsComponent} from "./ingredients.component";
import {CreateIngredientsComponent} from "./pages/create-ingredients/create-ingredients.component";

const routes: Routes = [
  {
    path:'',
    component:IngredientsComponent
  },
  {
    path:'create-ingredient',
    component: CreateIngredientsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IngredientsRoutingModule { }
