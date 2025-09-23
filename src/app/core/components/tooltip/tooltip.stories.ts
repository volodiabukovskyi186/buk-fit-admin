import { number, radios, text } from '@storybook/addon-knobs';
import { moduleMetadata } from '@storybook/angular';
import { ButtonModule } from '../button';
import { TooltipModule } from './tooltip.module';
import { OverlayModule } from '@angular/cdk/overlay';

export default {
  title: 'Tooltip',
  decorators: [
    moduleMetadata({ imports: [ ButtonModule, TooltipModule, OverlayModule] })
  ],
  declarations: []
}

const positions = {
  top: 'top',
  bottom: 'bottom',
  left: 'left',
  right: 'right'
}
export const primary = () => ({
  moduleMetadata: {
    declarations: []
  },
  props: {
    tooltipText: text('tooltipText', 'mock text mock text mock text mock text '),
    position: radios('position', positions, 'top'),
    tooltipMaxWidth: number('tooltipMaxWidth', 100)
  },
  template: "<div style='margin-left: 300px; margin-top: 200px'>" +
    "<cs-button-ui  [csTooltip]='tooltipText' [position]='position' [tooltipMaxWidth]='tooltipMaxWidth' text='This is tooltip button'></cs-button-ui>" +
    "</div>"
})
