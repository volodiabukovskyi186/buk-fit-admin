import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbsComponent } from './breadcrumbs.component';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';



@NgModule({
  declarations: [
    BreadcrumbsComponent
  ],
  imports: [
    TranslateModule,
    CommonModule,
    RouterModule
  ],
  exports: [BreadcrumbsComponent]
})
export class HSBreadcrumbsModule { }
