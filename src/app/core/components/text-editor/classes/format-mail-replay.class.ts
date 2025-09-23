import { AttachmentItemInterface } from '../interfaces/attachment-item.interface';

export class FormatMailReplay {
  value: string;

  constructor(html: string, attachments?: AttachmentItemInterface) {
    this.value = this.formatHtml(html, attachments);
  }

  private formatHtml(value, attachments): string {
    const countBlocks = this.countOfContainers(value);
    const color = this.getConteinerColor(countBlocks);

    value = value.replaceAll(/\n/g, '<br/>');
    value = value.replaceAll('hsl(0, 0%, 0%)', color);
    value = value.replaceAll('hsl(0,0%,0%)', color);

    let attachmentsStr = '';

    if (attachments?.length) {
      attachments.forEach((attachment: AttachmentItemInterface) => {
      attachmentsStr += ` <span style="color:${color}">< ${attachment.name}></span> <br/>`
      });

      const index = value.indexOf('<div', 4);
      if (index >= 0) {
        value = value.substr(0, index) + attachmentsStr + value.substr(index)
      } else {
        value += attachmentsStr
      }

    }

    return `<p><span style="color:${color}"></p> </span> <div class="ck-editor-block" style="padding-left: 10px; border-left:solid 2px ${color};"> `+
    ` ${value}</div><p><span style="color:${color}"></span></p>`
  }


  private getConteinerColor(countBlocks): string {
    const listColors = [
      'hsl(0, 75%, 60%);',
      'hsl(30, 75%, 60%);',
      'hsl(60, 75%, 60%);',
      'hsl(90, 75%, 60%);',
      'hsl(120, 75%, 60%);',
      'hsl(150, 75%, 60%);',
      'hsl(180, 75%, 60%);',
      'hsl(210, 75%, 60%);',
      'hsl(240, 75%, 60%);',
      'hsl(270, 75%, 60%);'];


    [30, 20, 10].forEach((count: number) => {
      if (count <= countBlocks) {
        countBlocks -= count;
      }
    });

    return listColors[countBlocks];
  }

  private countOfContainers(value: string): number {
    return value.split('ck-editor-block').length - 1;
  }

}
