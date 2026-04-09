import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Subscription} from 'rxjs';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {USER_STATUS_ENUM} from '../../../../../core/enums/users-status.enum';
import {TRAINING_TYPE_ENUM} from '../../../../../core/enums/training-type.enum';
import {USER_ROLES_ENUM} from '../../../../../core/enums/users-roles.enum';
import {VTCoachesService} from '../../../../../core/services/coaches/coaches.service';
import {UserInterface} from '../../../../../core/interfaces/user.interface';
import {UsersFiltersInterface} from '../../interfaces/users-filters.interface';

interface CoachOption {
  id: string;
  name: string;
}

@Component({
  selector: 'app-users-filters',
  templateUrl: './users-filters.component.html',
  styleUrl: './users-filters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersFiltersComponent implements OnInit, OnDestroy {
  @Input() currentUser: UserInterface;
  @Output() filtersChange = new EventEmitter<UsersFiltersInterface>();

  readonly form: FormGroup;
  readonly userStatusEnum = USER_STATUS_ENUM;
  readonly trainingTypeEnum = TRAINING_TYPE_ENUM;
  readonly userRoleEnum = USER_ROLES_ENUM;

  coaches: CoachOption[] = [];

  private subscription: Subscription = new Subscription();

  constructor(
    private readonly fb: FormBuilder,
    private readonly coachesService: VTCoachesService,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.form = this.buildForm();
  }

  ngOnInit(): void {
    this.loadCoaches();
    this.subscribeToFormChanges();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  get hasActiveFilters(): boolean {
    const v = this.form.value;
    return !!(v.status || v.coachId || v.trainingType || v.search?.trim());
  }

  onReset(): void {
    this.form.reset({
      status: '',
      coachId: '',
      trainingType: '',
      search: '',
    });
  }

  private buildForm(): FormGroup {
    return this.fb.nonNullable.group({
      status: [''],
      coachId: [''],
      trainingType: [''],
      search: [''],
    });
  }

  private loadCoaches(): void {
    if (this.currentUser?.role === USER_ROLES_ENUM.TRAINER) {
      return;
    }

    const coaches$ = this.coachesService.getCoaches().subscribe((coaches: CoachOption[]) => {
      this.coaches = coaches;
      this.cdr.markForCheck();
    });

    this.subscription.add(coaches$);
  }

  private subscribeToFormChanges(): void {
    const form$ = this.form.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
    ).subscribe(value => {
      this.filtersChange.emit(this.buildFilters(value));
    });

    this.subscription.add(form$);
  }

  private buildFilters(value: {
    status: string;
    coachId: string;
    trainingType: string;
    search: string;
  }): UsersFiltersInterface {
    return {
      status: (value.status as USER_STATUS_ENUM) || null,
      coachId: value.coachId || null,
      trainingType: (value.trainingType as TRAINING_TYPE_ENUM) || null,
      search: value.search?.trim() || null,
    };
  }
}
