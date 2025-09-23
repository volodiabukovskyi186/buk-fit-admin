import { ErrorStateMatcher, mixinDisabled, mixinDisableRipple } from "@angular/material/core";
import { mixinErrorState, mixinTabIndex } from "@angular/material/core";
import { FormGroupDirective, NgControl, NgForm } from "@angular/forms";
import { ElementRef } from "@angular/core";

import { Subject } from "rxjs";

export const HSSelectBaseMixin = mixinDisableRipple(
  mixinTabIndex(
    mixinDisabled(
      mixinErrorState(
        class {
          /**
           * Emits whenever the component state changes and should cause the parent
           * form-field to update. Implemented as part of `MatFormFieldControl`.
           * @docs-private
           */
          readonly stateChanges = new Subject<void>();

          constructor(
            public _elementRef: ElementRef,
            public _defaultErrorStateMatcher: ErrorStateMatcher,
            public _parentForm: NgForm,
            public _parentFormGroup: FormGroupDirective,
            /**
             * Form control bound to the component.
             * Implemented as part of `MatFormFieldControl`.
             * @docs-private
             */
            public ngControl: NgControl,
          ) { }
        },
      ),
    ),
  ),
);
