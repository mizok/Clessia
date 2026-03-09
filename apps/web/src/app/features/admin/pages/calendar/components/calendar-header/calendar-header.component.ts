import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-calendar-header',
  imports: [FormsModule, ButtonModule, DatePickerModule, TooltipModule],
  templateUrl: './calendar-header.component.html',
  styleUrl: './calendar-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarHeaderComponent {
  readonly currentDate = input.required<Date>();
  readonly viewMode = input<'calendar' | 'list'>('list');
  readonly isWeekView = input(false);
  readonly weekLabel = input('');
  readonly dayLabel = input('');
  readonly isCurrentPeriod = input(true);

  readonly prevPeriod = output<void>();
  readonly nextPeriod = output<void>();
  readonly goToday = output<void>();
  readonly viewModeChange = output<'calendar' | 'list'>();
  readonly dateJump = output<Date>();

  private readonly datepickerPopupRef = viewChild<ElementRef<HTMLElement>>('datepickerPopup');
  private readonly subtitleButtonRef = viewChild<ElementRef<HTMLElement>>('subtitleButton');

  protected readonly showDatePicker = signal(false);
  protected readonly subtitleLabel = computed(() =>
    this.isWeekView() ? this.weekLabel() : this.dayLabel(),
  );

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (!this.showDatePicker()) return;
    const target = event.target as HTMLElement;
    const popupEl = this.datepickerPopupRef()?.nativeElement;
    const buttonEl = this.subtitleButtonRef()?.nativeElement;
    if (popupEl && !popupEl.contains(target) && buttonEl && !buttonEl.contains(target)) {
      this.showDatePicker.set(false);
    }
  }

  protected toggleDatePicker(): void {
    if (this.viewMode() !== 'calendar') return;
    this.showDatePicker.update((visible) => !visible);
  }

  protected onDateJump(value: Date | Date[] | null | undefined): void {
    if (!(value instanceof Date)) return;
    this.dateJump.emit(value);
    this.showDatePicker.set(false);
  }

  protected onViewModeChange(mode: 'calendar' | 'list'): void {
    this.showDatePicker.set(false);
    this.viewModeChange.emit(mode);
  }
}
