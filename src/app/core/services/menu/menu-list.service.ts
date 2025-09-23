import { Injectable } from '@angular/core';

import { MenuSectionInterface } from '../../interfaces/menu-item.interface';
import { USER_ROLES_ENUM } from '../../enums/users-roles.enum';

@Injectable({
  providedIn: 'root'
})
export class MenuListService {

  constructor() { }

  get getMenuList(): MenuSectionInterface[] {
    return this.menuList;
  }
  // getMenuList(): MenuSectionInterface[] {
  //   return this.menuList;
  // }

  private menuList: MenuSectionInterface[] = [
    {
      title: 'Головна',
      sections: [
        {
          title: ' Клієнти',
          icon: '',
          isOpen: false,
          url: 'users',
          role: [USER_ROLES_ENUM.SUPER_ADMIN, USER_ROLES_ENUM.TRAINER, USER_ROLES_ENUM.MANAGER]
        },
        {
          title: 'Видалені клієнти',
          icon: '',
          isOpen: false,
          url: 'deleted-users',
          role: [USER_ROLES_ENUM.SUPER_ADMIN, USER_ROLES_ENUM.MANAGER]
        },
        {
          title: 'Тренери',
          icon: '',
          isOpen: false,
          url: 'coaches',
          role: [USER_ROLES_ENUM.SUPER_ADMIN, USER_ROLES_ENUM.MANAGER]
        },
        {
          title: 'Мій профіль',
          icon: '',
          isOpen: false,
          url: 'coach-profile',
          role: [USER_ROLES_ENUM.TRAINER]
        },
        {
          title: 'Вправи',
          icon: '',
          isOpen: false,
          url: 'exercises',
          role:[USER_ROLES_ENUM.SUPER_ADMIN, USER_ROLES_ENUM.MANAGER]
        },
        {
          title: 'Харчування',
          icon: '',
          isOpen: false,
          url: 'meals',
          role:[USER_ROLES_ENUM.SUPER_ADMIN, USER_ROLES_ENUM.MANAGER]
        },
        {
          title: 'Вправи домашні',
          icon: '',
          isOpen: false,
          url: 'exercises-home',
          role:[USER_ROLES_ENUM.SUPER_ADMIN, USER_ROLES_ENUM.MANAGER]
        },
        {
          title: 'Менеджери',
          icon: '',
          isOpen: false,
          url: 'managers',
          role:[USER_ROLES_ENUM.SUPER_ADMIN]
        },
        {
          title: 'Оплати',
          icon: '',
          isOpen: false,
          url: 'users-payments',
          role:[USER_ROLES_ENUM.SUPER_ADMIN]
        },
        {
          title: 'Привітальне повідомлення',
          icon: '',
          isOpen: false,
          url: 'welcome-messages',
          role:[USER_ROLES_ENUM.SUPER_ADMIN, USER_ROLES_ENUM.MANAGER]
        },
      ]
    },
  ]
}
