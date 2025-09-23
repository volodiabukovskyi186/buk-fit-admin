import { ReactiveFormsModule } from '@angular/forms';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { IQMenuHeaderComponent } from './components/menu-header/menu-header.component';
import { IQMenuItemComponent } from './components/menu-item/menu-item.component';
import { IQMenuTriggerDirective } from './directives/menu-trigger.directive';
import { IQMenuComponent } from './menu.component';

@NgModule({
  imports: [
    ReactiveFormsModule,
    OverlayModule,
    CommonModule,
    PortalModule
  ],
  exports: [
    IQMenuTriggerDirective,
    IQMenuHeaderComponent,
    IQMenuItemComponent,
    IQMenuComponent,
  ],
  declarations: [
    IQMenuTriggerDirective,
    IQMenuHeaderComponent,
    IQMenuComponent,
    IQMenuItemComponent
  ],
})
export class IQMenuModule {}
