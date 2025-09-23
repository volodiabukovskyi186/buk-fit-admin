/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { InjectionToken } from '@angular/core';
import { CdkAccordion } from '@angular/cdk/accordion';

/** HSAccordion's display modes. */
export type HSAccordionDisplayMode = 'default' | 'flat';

/** HSAccordion's toggle positions. */
export type HSAccordionTogglePosition = 'before' | 'after';

/**
 * Base interface for a `HSAccordion`.
 * @docs-private
 */
export interface HSAccordionBase extends CdkAccordion {
  /** Whether the expansion indicator should be hidden. */
  hideToggle: boolean;

  /** Display mode used for all expansion panels in the accordion. */
  displayMode: HSAccordionDisplayMode;

  /** The position of the expansion indicator. */
  togglePosition: HSAccordionTogglePosition;

  /** Handles keyboard events coming in from the panel headers. */
  _handleHeaderKeydown: (event: KeyboardEvent) => void;

  /** Handles focus events on the panel headers. */
  _handleHeaderFocus: (header: any) => void;
}

/**
 * Token used to provide a `HSAccordion` to `HSExpansionPanel`.
 * Used primarily to avoid circular imports between `HSAccordion` and `HSExpansionPanel`.
 */
export const HS_ACCORDION = new InjectionToken<HSAccordionBase>('HS_ACCORDION');
