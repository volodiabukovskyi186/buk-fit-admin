import {  CsTextEditorModule } from './text-editor.module';

export default {
  title: 'TextEditorComponent'
};
export const primary = () => ({
  moduleMetadata: {
    imports: [CsTextEditorModule]
  },
  props: {},
  template:
    `<div style="height:450px;"><cs-text-editor></cs-text-editor></div>`
});

