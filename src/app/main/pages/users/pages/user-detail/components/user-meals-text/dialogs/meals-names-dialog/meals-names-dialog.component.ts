import { Component, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { collection, DocumentSnapshot, Firestore, getDocs, limit, query, startAfter, where } from '@angular/fire/firestore';
import { USER_ROLES_ENUM } from '../../../../../../../../../core/enums/users-roles.enum';
import { Subscription } from 'rxjs';
import { BKCheckPaymentDateService } from '../../../../../../../../../core/services/date/check-payment-date.service';
import { AuthService } from '../../../../../../../../../core/services/auth/auth.service';
import { Router } from '@angular/router';
import { HSButtonModule } from '../../../../../../../../../core/components/button';
import { UserInterface } from '../../../../../../../../../core/interfaces/user.interface';
import { MealTypeEnum } from '../../../../../../../../../main/pages/meals-names/enums/meal-type.enum';

@Component({
  selector: 'bk-meals-names-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatPaginator, HSButtonModule],
  templateUrl: './meals-names-dialog.component.html',
  styleUrl: './meals-names-dialog.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class MealsNamesDialogComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator: MatPaginator;

  users: any[] = [];
  totalUsersCount = 0;
  pageSize = 10;
  lastVisible: DocumentSnapshot | null = null;
  user: UserInterface;
  searchQuery = '';
  userRoleEnum = USER_ROLES_ENUM;
  private subscription: Subscription = new Subscription();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<MealsNamesDialogComponent>,
    private bkCheckPaymentDateService: BKCheckPaymentDateService,
    private authService: AuthService,
    private dialog: MatDialog,
    private firestore: Firestore,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.getUserState();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  get filteredUsers(): any[] {
    if (!this.searchQuery.trim()) return this.users;
    const q = this.searchQuery.toLowerCase();
    return this.users.filter(u => u.name?.toLowerCase().includes(q));
  }

  close(): void {
    this.dialogRef.close(null);
  }

  selectMeal(item: any): void {
    this.dialogRef.close(item);
  }

  getMealEmoji(type: string): string {
    const map: { [key: string]: string } = {
      [MealTypeEnum.BREAKFAST]: '🌅',
      [MealTypeEnum.LUNCH]:     '☀️',
      [MealTypeEnum.DINNER]:    '🌙',
      [MealTypeEnum.SNACK]:     '🍎',
      'СНІДАНОК': '🌅',
      'ОБІД':     '☀️',
      'ВЕЧЕРЯ':   '🌙',
      'ПЕРЕКУС':  '🍎',
    };
    return map[type] || '🍽️';
  }

  getMealLabel(type: string): string {
    const map: { [key: string]: string } = {
      [MealTypeEnum.BREAKFAST]: 'Сніданок',
      [MealTypeEnum.LUNCH]:     'Обід',
      [MealTypeEnum.DINNER]:    'Вечеря',
      [MealTypeEnum.SNACK]:     'Перекус',
      'СНІДАНОК': 'Сніданок',
      'ОБІД':     'Обід',
      'ВЕЧЕРЯ':   'Вечеря',
      'ПЕРЕКУС':  'Перекус',
    };
    return map[type] || type;
  }

  getMealColor(type: string): string {
    const map: { [key: string]: string } = {
      [MealTypeEnum.BREAKFAST]: '#F2AF4A',
      [MealTypeEnum.LUNCH]:     '#27AE60',
      [MealTypeEnum.DINNER]:    '#9B51E0',
      [MealTypeEnum.SNACK]:     '#3FA1FB',
      'СНІДАНОК': '#F2AF4A',
      'ОБІД':     '#27AE60',
      'ВЕЧЕРЯ':   '#9B51E0',
      'ПЕРЕКУС':  '#3FA1FB',
    };
    return map[type] || '#3FA1FB';
  }

  getTotalCalories(meals: any[]): number {
    if (!meals?.length) return 0;
    return meals.reduce((sum, m) => sum + (Number(m.calories) || 0), 0);
  }

  onPageChange(event: PageEvent): void {
    this.getUsers(event.pageIndex, event.pageSize);
  }

  private getUserState(): void {
    const stream$ = this.authService.userState$.subscribe((user: UserInterface) => {
      this.user = user;
      this.getTotalUsersCount();
      this.getUsers();
    });
    this.subscription.add(stream$);
  }

  getTotalUsersCount(): void {
    const clientsCollection = collection(this.firestore, 'meals-names');
    const filterWhere = this.user.role === USER_ROLES_ENUM.TRAINER
      ? where('coachId', '==', this.user.id) : null;
    const q = filterWhere ? query(clientsCollection, filterWhere) : query(clientsCollection);
    getDocs(q).then(snapshot => {
      this.totalUsersCount = snapshot.size;
    }).catch(error => console.error('Помилка отримання кількості:', error));
  }

  getUsers(pageIndex: number = 0, newPageSize: number = this.pageSize): void {
    this.pageSize = newPageSize;
    const clientsCollection = collection(this.firestore, 'meals-names');
    let q = query(clientsCollection, limit(this.pageSize));

    if (this.lastVisible && pageIndex > 0) {
      q = query(q, startAfter(this.lastVisible));
    } else {
      this.lastVisible = null;
    }

    getDocs(q).then(snapshot => {
      if (!snapshot.empty) {
        this.lastVisible = snapshot.docs[snapshot.docs.length - 1];
        this.users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
    }).catch(error => console.error('Помилка отримання:', error));
  }
}
