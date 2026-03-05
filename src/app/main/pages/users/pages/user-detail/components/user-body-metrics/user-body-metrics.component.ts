import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {collection, collectionData, Firestore, orderBy, query, where} from '@angular/fire/firestore';
import {Timestamp} from '@angular/fire/firestore';
import {CommonModule} from '@angular/common';
import {Subscription} from 'rxjs';

export type GoalType = 'LOSE_WEIGHT' | 'GAIN_WEIGHT' | 'TONE_BODY';
export type ChartRange = 7 | 30 | 90 | 'all';

export interface BodyMetric {
  id?: string;
  userId: string;
  weightKg: number;
  createdAt: Timestamp;
  heightCm?: number;
  waistCm?: number;
  hipsCm?: number;
  chestCm?: number;
  photoUrl?: string;
  note?: string;
}

export interface Weight7dLevel {
  goalType: 'lose' | 'gain' | 'tone';
  kg: string;
  percent: string;
  emoji: string;
  headline: string;
  subtext: string;
  accentColor: string;
  accentBg: string;
  markerPercent: number;
  exceedsLeft: boolean;
  exceedsRight: boolean;
  barLabels: string[];
}

@Component({
  selector: 'bk-user-body-metrics',
  standalone: true,
  templateUrl: './user-body-metrics.component.html',
  styleUrls: ['./user-body-metrics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule]
})
export class UserBodyMetricsComponent implements OnInit, OnDestroy {
  metrics: BodyMetric[] = [];
  goal: GoalType = 'LOSE_WEIGHT';
  surveyData: any = null;
  loading = true;
  chartRange: ChartRange = 30;
  userId: string;

  private subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private firestore: Firestore,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.params['id'];
    this.loadMetrics();
    this.loadSurvey();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private loadMetrics(): void {
    const metricsRef = collection(this.firestore, `body/${this.userId}/metrics`);
    const metricsQuery = query(metricsRef, orderBy('createdAt', 'desc'));

    const sub = collectionData(metricsQuery, {idField: 'id'}).subscribe((data: any[]) => {
      this.metrics = data as BodyMetric[];
      this.loading = false;
      this.cdr.detectChanges();
    });
    this.subscription.add(sub);
  }

  private loadSurvey(): void {
    const surveyQuery = query(
      collection(this.firestore, 'user-survey'),
      where('id', '==', this.userId)
    );

    const sub = collectionData(surveyQuery).subscribe((surveys: any[]) => {
      if (surveys.length > 0) {
        this.surveyData = surveys[0];
        this.goal = surveys[0].goal || 'LOSE_WEIGHT';
      }
      this.cdr.detectChanges();
    });
    this.subscription.add(sub);
  }

  // ── Entry accessors ─────────────────────────────────────────────────────

  get latestEntry(): BodyMetric | null {
    return this.metrics[0] || null;
  }

  get prevEntry(): BodyMetric | null {
    return this.metrics[1] || null;
  }

  hasSurveyData(): boolean {
    return !!(this.surveyData?.measurements?.weight);
  }

  surveyWeightFormatted(): string {
    const w = this.surveyData?.measurements?.weight;
    return w != null ? String(w) : '—';
  }

  // ── Formatted values ────────────────────────────────────────────────────

  weightFormatted(): string {
    if (!this.latestEntry) return '—';
    return String(this.latestEntry.weightKg);
  }

  latestEntryDatetime(): string {
    if (!this.latestEntry) return '';
    const d = this.latestEntry.createdAt.toDate();
    return d.toLocaleDateString('uk-UA', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  // ── Delta (previous vs current) ─────────────────────────────────────────

  private get deltaRaw(): number | null {
    if (!this.latestEntry || !this.prevEntry) return null;
    return Math.round((this.latestEntry.weightKg - this.prevEntry.weightKg) * 10) / 10;
  }

  deltaDisplay(): string | null {
    const d = this.deltaRaw;
    if (d === null) return null;
    if (d === 0) return '0.0';
    return (d > 0 ? '+' : '') + d.toFixed(1);
  }

  deltaIsPositive(): boolean { return (this.deltaRaw ?? 0) > 0; }
  deltaIsNegative(): boolean { return (this.deltaRaw ?? 0) < 0; }

  deltaIsGood(): boolean {
    const d = this.deltaRaw;
    if (d === null) return false;
    if (this.goal === 'LOSE_WEIGHT') return d < 0;
    if (this.goal === 'GAIN_WEIGHT') return d > 0;
    return Math.abs(d) < 0.5;
  }

  deltaIsBad(): boolean {
    const d = this.deltaRaw;
    if (d === null) return false;
    return !this.deltaIsGood();
  }

  prevEntryDate(): string | null {
    if (!this.prevEntry) return null;
    return this.prevEntry.createdAt.toDate().toLocaleDateString('uk-UA', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  }

  // ── Best 30d ─────────────────────────────────────────────────────────────

  private getMetricsForDays(days: number): BodyMetric[] {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return this.metrics.filter(m => m.createdAt.toDate() >= cutoff);
  }

  private get best30dWeightValue(): number | null {
    const list = this.getMetricsForDays(30);
    if (!list.length) return null;
    if (this.goal === 'GAIN_WEIGHT') return Math.max(...list.map(m => m.weightKg));
    return Math.min(...list.map(m => m.weightKg));
  }

  best30dLabel(): string {
    return this.goal === 'GAIN_WEIGHT' ? 'Макс. за 30 днів' : 'Мін. за 30 днів';
  }

  best30dFormatted(): string {
    const w = this.best30dWeightValue;
    return w != null ? w.toFixed(1) + ' кг' : '—';
  }

  best30dSubLabel(): string {
    const w = this.best30dWeightValue;
    if (!w || !this.latestEntry) return '';
    const diff = Math.round((this.latestEntry.weightKg - w) * 10) / 10;
    if (Math.abs(diff) < 0.05) return 'це ваш рекорд!';
    return (diff > 0 ? '+' : '') + diff.toFixed(1) + ' від поточного';
  }

  // ── 7-day progress level ─────────────────────────────────────────────────

  get weight7dLevel(): Weight7dLevel | null {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recent = this.metrics.filter(m => m.createdAt.toDate() >= sevenDaysAgo);
    if (recent.length < 2) return null;

    const oldest = recent[recent.length - 1];
    const newest = recent[0];
    const kgChange = newest.weightKg - oldest.weightKg;
    const pctChange = (kgChange / oldest.weightKg) * 100;
    const kgStr = (kgChange >= 0 ? '+' : '') + kgChange.toFixed(1) + ' кг';
    const pctStr = (pctChange >= 0 ? '+' : '') + pctChange.toFixed(2) + '%';

    if (this.goal === 'LOSE_WEIGHT') return this.buildLoseLevel(kgChange, pctChange, kgStr, pctStr);
    if (this.goal === 'GAIN_WEIGHT') return this.buildGainLevel(kgChange, pctChange, kgStr, pctStr);
    return this.buildToneLevel(kgChange, pctChange, kgStr, pctStr);
  }

  private buildLoseLevel(kg: number, pct: number, kgStr: string, pctStr: string): Weight7dLevel {
    // Bar: very-gain | gain | slow | ideal  (left=bad → right=good)
    // Range ±1.5%, marker 0% = +1.5% (left), 100% = -1.5% (right)
    const markerPercent = Math.max(0, Math.min(100, ((1.5 - pct) / 3) * 100));

    let headline: string, subtext: string, emoji: string, accentColor: string, accentBg: string;
    if (pct < -1.5) {
      headline = 'Швидке схуднення 🚀'; subtext = 'Ви дуже швидко худнете — стежте за самопочуттям';
      emoji = '🚀'; accentColor = '#F2994A'; accentBg = '#FEF6E7';
    } else if (pct <= -0.5) {
      headline = 'Ідеальний темп 🔥'; subtext = 'Відмінний прогрес — продовжуйте в тому ж дусі!';
      emoji = '🔥'; accentColor = '#27AE60'; accentBg = '#E6F7EE';
    } else if (pct < 0) {
      headline = 'Є рух вперед 💪'; subtext = 'Є невеликий прогрес — продовжуйте!';
      emoji = '💪'; accentColor = '#F2994A'; accentBg = '#FEF6E7';
    } else {
      headline = 'Не здавайся 😤'; subtext = 'Вага зростає — варто переглянути план';
      emoji = '😤'; accentColor = '#E95032'; accentBg = '#FDECEA';
    }

    return {
      goalType: 'lose', kg: kgStr, percent: pctStr, emoji, headline, subtext,
      accentColor, accentBg, markerPercent,
      exceedsLeft: pct > 1.5, exceedsRight: pct < -1.5,
      barLabels: ['+1.5%', '+0.5%', '0', '-0.5%', '-1.5%']
    };
  }

  private buildGainLevel(kg: number, pct: number, kgStr: string, pctStr: string): Weight7dLevel {
    // Bar: ideal | slow | gain | very-gain  (left=best gain → right=losing)
    // marker: pct=+1.5% → 0% (ideal left), pct=-1.5% → 100% (very-gain right)
    const markerPercent = Math.max(0, Math.min(100, ((1.5 - pct) / 3) * 100));

    let headline: string, subtext: string, emoji: string, accentColor: string, accentBg: string;
    if (pct > 1.5) {
      headline = 'Швидкий набір 🚀'; subtext = 'Дуже швидко набираєте — стежте за якістю';
      emoji = '🚀'; accentColor = '#F2994A'; accentBg = '#FEF6E7';
    } else if (pct >= 0.25) {
      headline = 'Ідеальний темп набору 🔥'; subtext = 'Відмінний прогрес набору маси!';
      emoji = '🔥'; accentColor = '#27AE60'; accentBg = '#E6F7EE';
    } else if (pct >= 0) {
      headline = 'Є невеликий прогрес 💪'; subtext = 'Повільний набір — спробуйте збільшити калорії';
      emoji = '💪'; accentColor = '#F2994A'; accentBg = '#FEF6E7';
    } else {
      headline = 'Вага знижується 😤'; subtext = 'Вага падає — потрібно переглянути харчування';
      emoji = '😤'; accentColor = '#E95032'; accentBg = '#FDECEA';
    }

    return {
      goalType: 'gain', kg: kgStr, percent: pctStr, emoji, headline, subtext,
      accentColor, accentBg, markerPercent,
      exceedsLeft: pct > 1.5, exceedsRight: pct < -1.5,
      barLabels: ['+1.5%', '+0.5%', '0', '-0.5%', '-1.5%']
    };
  }

  private buildToneLevel(kg: number, pct: number, kgStr: string, pctStr: string): Weight7dLevel {
    // Bar: very-gain | slow | ideal | slow | very-gain  (center=0%=ideal)
    // marker: pct=-1.5% → 0%, pct=0% → 50%, pct=+1.5% → 100%
    const markerPercent = Math.max(0, Math.min(100, ((pct + 1.5) / 3) * 100));
    const abs = Math.abs(pct);

    let headline: string, subtext: string, emoji: string, accentColor: string, accentBg: string;
    if (abs <= 0.4) {
      headline = 'Вага стабільна 🔥'; subtext = 'Ідеальний результат для підтягування тіла';
      emoji = '🔥'; accentColor = '#27AE60'; accentBg = '#E6F7EE';
    } else if (abs <= 1) {
      headline = 'Незначна зміна 💪'; subtext = 'Вага трохи змінилась — це нормально';
      emoji = '💪'; accentColor = '#F2994A'; accentBg = '#FEF6E7';
    } else {
      headline = 'Значна зміна ваги ⚠️'; subtext = 'Суттєва зміна ваги — зверніть увагу';
      emoji = '⚠️'; accentColor = '#E95032'; accentBg = '#FDECEA';
    }

    return {
      goalType: 'tone', kg: kgStr, percent: pctStr, emoji, headline, subtext,
      accentColor, accentBg, markerPercent,
      exceedsLeft: pct < -1.5, exceedsRight: pct > 1.5,
      barLabels: ['-1.5%', '-0.5%', '0%', '+0.5%', '+1.5%']
    };
  }

  // ── Chart ────────────────────────────────────────────────────────────────

  get chartMetrics(): BodyMetric[] {
    const source = this.chartRange === 'all'
      ? [...this.metrics]
      : [...this.getMetricsForDays(this.chartRange)];
    return source.reverse();
  }

  setChartRange(range: ChartRange): void {
    this.chartRange = range;
  }

  get svgPolylinePoints(): string {
    const data = this.chartMetrics;
    if (data.length < 2) return '';
    const {points} = this.calcSvgCoords(data);
    return points.map(p => `${p.x},${p.y}`).join(' ');
  }

  get svgDots(): {x: number; y: number; weight: number; date: Date; isFirst: boolean; isLast: boolean}[] {
    const data = this.chartMetrics;
    if (!data.length) return [];
    const {points} = this.calcSvgCoords(data);
    return points.map((p, i) => ({
      ...p,
      weight: data[i].weightKg,
      date: data[i].createdAt.toDate(),
      isFirst: i === 0,
      isLast: i === data.length - 1
    }));
  }

  get svgAreaPath(): string {
    const data = this.chartMetrics;
    if (data.length < 2) return '';
    const {points, height, padY} = this.calcSvgCoords(data);
    const pts = points.map(p => `${p.x},${p.y}`).join(' ');
    const first = points[0];
    const last = points[points.length - 1];
    const bottom = height - padY;
    return `M ${first.x},${bottom} L ${pts.split(' ').map((_,i,arr) => arr[i]).join(' L ')} L ${last.x},${bottom} Z`;
  }

  private calcSvgCoords(data: BodyMetric[]): {points: {x: number; y: number}[]; height: number; padY: number} {
    const W = 580, H = 160, padX = 28, padY = 12;
    const weights = data.map(m => m.weightKg);
    const minW = Math.min(...weights);
    const maxW = Math.max(...weights);
    const range = maxW - minW || 1;
    const points = data.map((m, i) => ({
      x: padX + (i / Math.max(data.length - 1, 1)) * (W - 2 * padX),
      y: padY + (1 - (m.weightKg - minW) / range) * (H - 2 * padY)
    }));
    return {points, height: H, padY};
  }

  get svgYLabels(): {y: number; value: number}[] {
    const data = this.chartMetrics;
    if (data.length < 2) return [];
    const H = 160, padY = 12;
    const weights = data.map(m => m.weightKg);
    const minW = Math.min(...weights);
    const maxW = Math.max(...weights);
    const range = maxW - minW || 1;
    return [maxW, (minW + maxW) / 2, minW].map(v => ({
      y: padY + (1 - (v - minW) / range) * (H - 2 * padY),
      value: Math.round(v * 10) / 10
    }));
  }

  get svgXLabels(): {x: number; label: string}[] {
    const data = this.chartMetrics;
    if (data.length < 2) return [];
    const W = 580, padX = 28;
    const indices = data.length <= 5
      ? data.map((_, i) => i)
      : [0, Math.floor(data.length / 2), data.length - 1];
    return indices.map(i => ({
      x: padX + (i / Math.max(data.length - 1, 1)) * (W - 2 * padX),
      label: data[i].createdAt.toDate().toLocaleDateString('uk-UA', {day: '2-digit', month: '2-digit'})
    }));
  }
}
