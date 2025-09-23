import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { PanelHeaderService } from '../core/services/panel-header.service';

@Component({
  selector: 'bk-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MainComponent implements OnInit {
  isOpen = false;
  constructor(
    private panelHeaderService: PanelHeaderService
  ){}

  ngOnInit(): void {
   this.mobileMenuState();
  }

  openMenu(value): void {    
    this.isOpen = value;
    this.panelHeaderService.triggerMobileMenu(this.isOpen)
  }

  private mobileMenuState(): void {
    const stream$ = this.panelHeaderService.triggerMobileMenu$.subscribe((isOpen: boolean) => {
      this.isOpen = isOpen;      
    });

    // this.subscription.add(stream$);
  }
}
