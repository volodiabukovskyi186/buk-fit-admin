import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { HSButtonComponent } from "./button.component";
import { HSTextButtonComponent } from "./components/text-button/text-button.component";

@NgModule({
  imports: [CommonModule],
  exports: [HSButtonComponent, HSTextButtonComponent],
  declarations: [HSButtonComponent, HSTextButtonComponent],
  providers: [],
})
export class HSButtonModule {}
