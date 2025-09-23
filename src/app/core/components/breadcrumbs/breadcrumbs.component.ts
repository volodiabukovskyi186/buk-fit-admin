import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import { KeycloakService } from 'keycloak-angular';

import { BreadcrumbsInterface } from 'src/app/core/interfaces/breadcrumbs.interface';
import { BREAD_CRUMBS_SPECIAL_ROUTE } from './breadcrumbs.enum';
import { UserService } from 'src/app/core/services/admins/admin.service';

@Component({
  selector: 'hs-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BreadcrumbsComponent implements OnInit {
  @Input() breadcrumbs!: BreadcrumbsInterface[];

  user: any;

  constructor (
    // private keycloakService: KeycloakService,
    private userService: UserService,
    private _location: Location,
    private router: Router
  ){}

  ngOnInit(): void {
    // this.getAuthUser();
  }

  navigate(path: string): void {
    if (path === BREAD_CRUMBS_SPECIAL_ROUTE.ROUTER_EMPTY) {
      return;
    }
    
    if (path === BREAD_CRUMBS_SPECIAL_ROUTE.ROUTER_BACK) {
      this._location.back();
      return;
    }
    
    this.router.navigate([path])
  }
}
