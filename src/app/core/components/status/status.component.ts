import { AfterContentInit, Component, HostBinding, Input, OnInit, ViewEncapsulation } from '@angular/core';
import {USER_STATUS_ENUM} from '../../enums/users-status.enum';

@Component({
  selector: 'hs-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class StatusComponent implements OnInit {
  @Input() statusType = '';

  @Input()
  set type(value: string) {
    this.statusType = value;
    this.setData();
  }

  @Input() isDot = false;

  title: string;
  styleClass: string;

  @HostBinding('class')
  get colorClass(): string {
    return `status-${this.styleClass}`;
  }

  ngOnInit(): void {
    this.setData();
  }

  private setData(): void {

    switch (this.statusType) {
      case USER_STATUS_ENUM.NEW:
        this.title = USER_STATUS_ENUM.NEW;
        this.styleClass = 'in-progress';
        console.log(22222, this.statusType)
        return;

      case USER_STATUS_ENUM.ACTIVE:
        this.title = USER_STATUS_ENUM.ACTIVE;
        this.styleClass = 'answered';
        return;

      case USER_STATUS_ENUM.BLOCKED:
        this.title = USER_STATUS_ENUM.BLOCKED;
        this.styleClass = 'blocked';
        return;

      case USER_STATUS_ENUM.DELETED:
        this.title = USER_STATUS_ENUM.DELETED;
        this.styleClass = 'deleted';
        return;


      default:
        this.title = this.type;
    }


  }

}
