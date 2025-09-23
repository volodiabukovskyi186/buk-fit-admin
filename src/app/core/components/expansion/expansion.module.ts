import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { HSExpansionPanelHeaderComponent } from './components/expansion-header/expansion-panel-header';
import { HSExpansionPanelComponent } from './components/expansion-panel/expansion-panel.component';

@NgModule({
  declarations: [
    HSExpansionPanelHeaderComponent,
    HSExpansionPanelComponent,
  ],
  exports: [
    HSExpansionPanelHeaderComponent,
    HSExpansionPanelComponent,
  ],
  imports: [
    CommonModule
  ],
})
export class HSExpansionModule {
}
