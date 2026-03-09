import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';
import type { Session } from '@core/sessions.service';
import {
  SessionCalendarGridComponent,
  type SessionCalendarGridOverflowEvent,
} from '../session-calendar-grid/session-calendar-grid.component';
import { SessionBatchComponent, type BatchMode } from '../session-batch/session-batch.component';
import {
  SessionListComponent,
  type SessionListMenuRequest,
} from '../session-list/session-list.component';

export type CalendarBodyContextMenuEvent = SessionListMenuRequest;
export type CalendarBodyOverflowEvent = SessionCalendarGridOverflowEvent;
export type CalendarBodyBatchMode = BatchMode;

@Component({
  selector: 'app-calendar-body',
  imports: [SkeletonModule, SessionListComponent, SessionBatchComponent, SessionCalendarGridComponent],
  templateUrl: './calendar-body.component.html',
  styleUrl: './calendar-body.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarBodyComponent {
  readonly viewMode = input<'calendar' | 'list'>('calendar');
  readonly loading = input(false);
  readonly sessions = input<Session[]>([]);
  readonly selectedIds = input<ReadonlySet<string>>(new Set<string>());

  readonly selectedCount = input(0);

  readonly isWeekView = input(false);
  readonly weekDays = input<Date[]>([]);
  readonly currentDate = input.required<Date>();

  readonly selectedIdsChange = output<string[]>();
  readonly contextMenuRequested = output<CalendarBodyContextMenuEvent>();
  readonly clearSelection = output<void>();
  readonly openBatchSheet = output<CalendarBodyBatchMode | null>();
  readonly sessionClick = output<Session>();
  readonly overflowClick = output<CalendarBodyOverflowEvent>();
}
