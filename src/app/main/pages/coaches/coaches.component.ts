import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { DocumentSnapshot } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { TableGridDataTypeEnum } from '../../../core/components/table-grid';
import { UserInterface } from '../../../core/interfaces/user.interface';
import { VTCoachesService } from '../../../core/services/coaches/coaches.service';

@Component({
  selector: 'app-coach',
  templateUrl: './coaches.component.html',
  styleUrls: ['./coaches.component.scss'],
})
export class CoachesComponent implements OnInit, OnDestroy {

  @ViewChild(MatPaginator) paginator: MatPaginator;

  tableGridDataTypeEnum = TableGridDataTypeEnum;

  coaches: UserInterface[] = [];
  totalCoachesCount = 0;
  pageSize = 10;

  private lastVisible: DocumentSnapshot | null = null;
  private subscription = new Subscription();

  constructor(
    private router: Router,
    private coachesService: VTCoachesService
  ) {}

  ngOnInit(): void {
    this.loadTotalCount();
    this.loadCoaches();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;

    if (event.pageIndex === 0) {
      this.lastVisible = null;
    }

    this.loadCoaches(event.pageIndex);
  }

  moveToCoach(id: string): void {
    this.router.navigate(['/coaches/coach/', id]);
  }

  private loadTotalCount(): void {
    const count$ = this.coachesService.getTrainersCount().subscribe(count => {
      this.totalCoachesCount = count;
    });
    this.subscription.add(count$);
  }

  private loadCoaches(pageIndex: number = 0): void {
    const cursor = pageIndex > 0 ? this.lastVisible : null;

    const coaches$ = this.coachesService.getTrainersPaginated(this.pageSize, cursor).subscribe(result => {
      this.coaches = result.coaches;
      this.lastVisible = result.lastVisible;
    });
    this.subscription.add(coaches$);
  }
}
