import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {DocumentSnapshot} from '@angular/fire/firestore';
import {Router} from '@angular/router';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {TableGridDataTypeEnum} from '../../../core/components/table-grid';
import {ClientInterface, EnrichedClientInterface, TgUser, UserInterface} from '../../../core/interfaces/user.interface';
import {AuthService} from '../../../core/services/auth/auth.service';
import {Subscription} from 'rxjs';
import {USER_ROLES_ENUM} from '../../../core/enums/users-roles.enum';
import {PAYMENT_DATE_ENUM} from '../../../core/enums/payment-date/payment-date.enum';
import {BKCheckPaymentDateService} from '../../../core/services/date/check-payment-date.service';
import {UsersService} from './users.service';
import {Timestamp} from '@angular/fire/firestore';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator: MatPaginator;

  users: EnrichedClientInterface[] = [];
  totalUsersCount = 0;
  pageSize = 10;
  user: UserInterface;

  readonly tableGridDataTypeEnum = TableGridDataTypeEnum;
  readonly paymentDateEnum = PAYMENT_DATE_ENUM;
  readonly userRoleEnum = USER_ROLES_ENUM;

  private lastVisible: DocumentSnapshot | null = null;
  private subscription: Subscription = new Subscription();

  constructor(
    private bkCheckPaymentDateService: BKCheckPaymentDateService,
    private authService: AuthService,
    private usersService: UsersService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subscribeToUserState();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.loadUsers(event.pageIndex, event.pageSize);
  }

  moveToMessage(id: string): void {
    this.router.navigate([`/users/user/`, id]);
  }

  moveToTg(tgUser: TgUser): void {
    window.open(`https://t.me/${tgUser.username}`);
  }

  getStartDayClass(startDayFrom: Timestamp | null | undefined): string {
    if (!startDayFrom?.seconds) return '';

    const target = new Date(startDayFrom.seconds * 1000);
    target.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return 'fc-error';
    if (diffDays <= 3) return 'fc-warning';
    return 'fc-success';
  }

  private subscribeToUserState(): void {
    const stream$ = this.authService.userState$.subscribe((user: UserInterface) => {
      this.user = user;
      this.loadTotalCount();
      this.loadUsers();
    });

    this.subscription.add(stream$);
  }

  private loadTotalCount(): void {
    this.usersService
      .getClientsCount(this.user.role, this.user.id)
      .then(count => {
        this.totalUsersCount = count;
      });
  }

  private loadUsers(pageIndex: number = 0, newPageSize: number = this.pageSize): void {
    this.pageSize = newPageSize;

    if (pageIndex === 0) {
      this.lastVisible = null;
    }

    this.usersService
      .getClientsPage(this.user.role, this.user.id, this.pageSize, pageIndex, this.lastVisible)
      .then(({ clients, lastVisible }) => {
        this.lastVisible = lastVisible;
        this.users = clients.map(user => this.enrichUserData(user));
      });
  }

  private enrichUserData(user: ClientInterface): EnrichedClientInterface {
    return {
      ...user,
      paymentStatus: this.bkCheckPaymentDateService.checkPaymentDate(user.payDate),
      programUpdateStatus: this.getProgramUpdateStatus(user.programUpdatedAt),
    };
  }

  private getProgramUpdateStatus(programUpdatedAt?: string): 'NORMAL' | 'WARNING' | 'DANGER' {
    if (!programUpdatedAt) return 'DANGER';
    const diffDays = Math.floor((Date.now() - new Date(programUpdatedAt).getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays >= 8) return 'DANGER';
    if (diffDays === 7) return 'WARNING';
    return 'NORMAL';
  }
}
