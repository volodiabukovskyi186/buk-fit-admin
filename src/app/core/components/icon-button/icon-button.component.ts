import { ChangeDetectionStrategy, Component, ViewEncapsulation } from "@angular/core";
import { DomSanitizer } from '@angular/platform-browser';

import { HSIconButtonBase } from './icon-button-base.component';

@Component({
  selector: "hs-icon-button",
  templateUrl: "./icon-button.component.html",
  styleUrls: ["./icon-button.component.scss"],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HSIconButtonComponent extends HSIconButtonBase {

  constructor(protected override sanitizer: DomSanitizer) {
    super(sanitizer)
  }
}
