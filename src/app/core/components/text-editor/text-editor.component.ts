import { AfterViewInit, Component, ElementRef, EventEmitter, forwardRef, Input, Output, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import * as CkeditorBuild from './ckeditor/build/ckeditor';

@Component({
  selector: 'cs-text-editor',
  templateUrl: './text-editor.component.html',
  styleUrls: ['./text-editor.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextEditorComponent),
      multi: true
    }
  ],
  encapsulation: ViewEncapsulation.None
})
export class TextEditorComponent implements AfterViewInit {
  @Input() scrollTextContainer = true;
  @Output() blur: EventEmitter<any> = new EventEmitter<any>();
  
  @ViewChild("editorRef") editorRef: any;

  editorBuild = CkeditorBuild;
  editor: any;
  disabled = false;
  value = '';

  configuration: any = {
    toolbar: [
      'heading',
      'fontSize',
      'fontColor',
      'bold',
      'italic',
      'underline',
      // 'bulletedList',
      // 'numberedList',
      // 'indent',
      // 'outdent',
      'undo',
      'redo',

    ],
    fontSize: {
      options: [
        '10px',
        '12px',
        '14px',
        'default',
        '18px',
        '20px',
        '22px',
        '24px',
        '26px'
      ]
    },
    placeholder: '',
    htmlDataProcessor: true
  };

  constructor(private renderer: Renderer2, private el: ElementRef) { }

  ngAfterViewInit(): void {

    this.setValueToEditor();
  }

  public focusOnEditor(): void {    
    this.editor.focus();
  }


  public setInitValue(value: string): void {
    this.value = value;
  }

  public onBlur(): void {    
    this.blur.emit(true)
  }

  setValueToEditor(): void {
    setTimeout(() => {
      this.editor.setData(this.value);
      // this.editor.execute('fontColor', { value: this.editor.plugins.get('FontColorUI').colorTableView.colorDefinitions[0].color });
    })
  }

  onChange: any = () => { };

  onTouch: any = () => { };

  writeValue(value: string): void {


    this.value = value || '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  valueChange(value: string): void {

    this.onChange(value);
  }

  editorReady(editor: any): void {
    editor.model.document.on('change', () => {

      // this.changeBtnFontColor();
      // this.changeBtnFontSize();


    });

    this.addIdToEditorItem(editor);
  }

  private addIdToEditorItem(editor: any): void {


    this.editor = editor;

    return;// remove afte
    this.convertElemAttributes(this.editor, 'div');

    this.configuration.toolbar.forEach((id: string, index: number) => {
      const element: HTMLElement = editor.ui.view.toolbar.items.get(index).element;
      element.id = id;

      switch (id) {
        case 'fontSize':
          this.createFontSizeBtn(element);
          break;
        case 'fontColor':
          this.createFontColorBtn(element);
          break;
        case 'heading':
          this.dropDownIcon(element as HTMLElement);
          break;

        default:
          this.changeIconButtons(element, id);
      }

      this.getElementByClass('ck-icon', element).innerHTML = '';
      (this.getElementByClass('ck-icon', element) as HTMLElement).style.display = 'none';
    });
  }

  private changeIconButtons(element: HTMLElement, id: string): void {
    const button = this.getButtonElement(element);

    const icon = this.renderer.createElement('i');

    if (id === 'numberedList') {
      this.renderer.addClass(icon, 'cs-icon-ck-numbered');
    } else if (id === 'bulletedList') {
      this.renderer.addClass(icon, 'cs-icon-ck-bulleted');
    } else {
      this.renderer.addClass(icon, 'cs-icon-ck-' + id);
    }

    this.renderer.insertBefore(
      button,
      icon,
      this.getElementByClass('ck-icon', element)
    );
  }

  private createFontColorBtn(element: HTMLElement): void {
    this.dropDownIcon(element);

    const button = this.getButtonElement(element);

    const div = this.renderer.createElement('div');
    this.renderer.addClass(div, 'font-color');
    this.renderer.appendChild(button, div);
    this.changeBtnFontColor();
  }

  private dropDownIcon(element: HTMLElement): void {
    const downIcon = this.getElementByClass('ck-dropdown__arrow', element);

    const button = this.getButtonElement(element);

    const icon = this.renderer.createElement('i');
    this.renderer.addClass(icon, 'cs-icon-arrow');
    this.renderer.addClass(icon, 'rotate-min-90');
    this.renderer.addClass(icon, 'rotate-plus-90');

    this.renderer.appendChild(button, icon);
    downIcon.innerHTML = '';
    downIcon.style.display = 'none';
  }

  private changeBtnFontColor(): void {
    // let color = this.editor.plugins.get('FontColorUI').colorTableView.selectedColor;

    // if (!color) {
    //   color = this.editor.plugins.get('FontColorUI').colorTableView.colorDefinitions[0].color;
    // }

    // const fontColor = this.getElementByClass('font-color');
    // this.renderer.setStyle(fontColor, 'background-color', color);
  }

  private createFontSizeBtn(element: HTMLElement) {

    const button = this.getButtonElement(element);

    const div = this.renderer.createElement('div');
    this.renderer.addClass(div, 'font-size');
    this.renderer.appendChild(button, div);

    this.dropDownIcon(element);
    this.changeBtnFontSize();
  }

  private changeBtnFontSize(): void {
    let size = this.editor.model.document.selection.getAttribute('fontSize');
    if (!size) {
      size = '16px';
    }

    const fontSize = this.getElementByClass('font-size');
    fontSize.innerHTML = size;
  }

  private getButtonElement(btnElem: HTMLElement) {
    const element = this.getElementByClass('ck-button', btnElem);

    let button: HTMLElement;

    if (element) {
      button = element;
    } else {
      button = btnElem;
    }

    return button;
  }

  private getElementByClass(elementName: string, element?: HTMLElement) {
    if (!element) {
      return this.el.nativeElement.getElementsByClassName(elementName)[0];
    }

    return element.getElementsByClassName(elementName)[0];
  }

  private convertElemAttributes(editor, elemName): void {
    editor.model.schema.register(elemName, {
      allowWhere: '$block',
      allowContentOf: '$root'
    });

    editor.model.schema.addAttributeCheck((context: string) => {
      if (context.endsWith(elemName)) {
        return true;
      }
      return ''
    });

    editor.conversion.for('upcast').elementToElement({
      view: elemName,
      model: (viewElement, { writer: modelWriter }) => {
        return modelWriter.createElement(elemName, viewElement.getAttributes());
      }
    });

    editor.conversion.for('downcast').elementToElement({
      model: elemName,
      view: elemName
    });

    editor.conversion.for('downcast').add(dispatcher => {
      dispatcher.on('attribute', (evt, data, conversionApi) => {
        if (data.item.name != elemName) {
          return;
        }

        const viewWriter = conversionApi.writer;
        const viewDiv = conversionApi.mapper.toViewElement(data.item);

        if (data.attributeNewValue) {
          viewWriter.setAttribute(data.attributeKey, data.attributeNewValue, viewDiv);
        } else {
          viewWriter.removeAttribute(data.attributeKey, viewDiv);
        }
      });
    });
  }

}
