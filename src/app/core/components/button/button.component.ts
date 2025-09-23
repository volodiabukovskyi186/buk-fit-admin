import { ChangeDetectionStrategy, Component, ViewEncapsulation } from "@angular/core";
import { DomSanitizer } from '@angular/platform-browser';

import { HSButtonBase } from './button-base.component';

@Component({
  selector: "hs-button",
  templateUrl: "./button.component.html",
  styleUrls: ["./button.component.scss"],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HSButtonComponent extends HSButtonBase {

  constructor(protected override sanitizer: DomSanitizer) {
    super(sanitizer)
  }
}
