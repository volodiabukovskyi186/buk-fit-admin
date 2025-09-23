import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IngredientsRoutingModule } from './ingredients-routing.module';
import { IngredientsComponent } from './ingredients.component';
import {HSButtonModule} from "../../../core/components/button";
import {TableGridModule} from "../../../core/components/table-grid";
import {HSSelectModule} from "../../../core/components/select/select.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ButtonToggleModule} from "../../../core/components/button-toggle/button-toggle.module";
import {MatDialogModule} from "@angular/material/dialog";
import {HSInputModule} from "../../../core/components/input";
import {HSFormFieldModule} from "../../../core/components/form-field";
import {HSTimeToUtcModule} from "../../../core/pipes/utc-to-local/utc-to-local.module";
import {ClipboardModule} from "@angular/cdk/clipboard";
import {UsersRoutingModule} from "../users/users-routing.module";
import {HSIconButtonModule} from "../../../core/components/icon-button";
import {CreateIngredientsComponent} from "./pages/create-ingredients/create-ingredients.component";


@NgModule({
  declarations: [
    IngredientsComponent,
    CreateIngredientsComponent
  ],
  imports: [
    CommonModule,
    IngredientsRoutingModule,
    HSButtonModule,
    TableGridModule,
    HSSelectModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonToggleModule,
    MatDialogModule,
    HSInputModule,
    HSFormFieldModule,
    HSTimeToUtcModule,
    ClipboardModule,
    ReactiveFormsModule,
    FormsModule,
    HSButtonModule,
    TableGridModule,
    HSIconButtonModule
  ]
})
export class IngredientsModule { }
