import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { format, isToday } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import type { Session } from '@core/sessions.service';

const CALENDAR_START_HOUR = 8;
const CALENDAR_END_HOUR = 22;
const SLOT_HEIGHT_PX = 36;

interface RenderSessionSlot {
  readonly session: Session;
  readonly width: number;
  readonly left: number;
}

interface RenderOverflow {
  readonly startTime: string;
  readonly count: number;
  readonly sessions: Session[];
}

export interface SessionCalendarGridOverflowEvent {
  readonly startTime: string;
  readonly sessions: Session[];
}

@Component({
  selector: 'app-session-calendar-grid',
  imports: [],
  templateUrl: './session-calendar-grid.component.html',
  styleUrl: './session-calendar-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionCalendarGridComponent {
  readonly sessions = input<Session[]>([]);
  readonly isWeekView = input(false);
  readonly weekDays = input<Date[]>([]);
  readonly currentDate = input.required<Date>();

  readonly sessionClick = output<Session>();
  readonly overflowClick = output<SessionCalendarGridOverflowEvent>();

  protected readonly timeSlots = computed(() => {
    const slots: string[] = [];
    for (let h = CALENDAR_START_HOUR; h < CALENDAR_END_HOUR; h++) {
      slots.push(`${String(h).padStart(2, '0')}:00`);
      slots.push(`${String(h).padStart(2, '0')}:30`);
    }
    return slots;
  });

  protected readonly gridHeight = computed(
    () => (CALENDAR_END_HOUR - CALENDAR_START_HOUR) * 2 * SLOT_HEIGHT_PX,
  );

  protected getSessionTop(startTime: string): number {
    const [h, m] = startTime.split(':').map(Number);
    return ((h - CALENDAR_START_HOUR) * 2 + m / 30) * SLOT_HEIGHT_PX;
  }

  protected getSessionHeight(startTime: string, endTime: string): number {
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const mins = eh * 60 + em - (sh * 60 + sm);
    return Math.max((mins / 30) * SLOT_HEIGHT_PX, SLOT_HEIGHT_PX);
  }

  protected getSessionsForDay(day: Date): Session[] {
    const dateStr = format(day, 'yyyy-MM-dd');
    return this.sessions().filter((session) => session.sessionDate === dateStr);
  }

  protected getRenderSessionsForDay(day: Date): {
    slots: RenderSessionSlot[];
    overflows: RenderOverflow[];
  } {
    const daySessions = this.getSessionsForDay(day);
    if (daySessions.length === 0) return { slots: [], overflows: [] };

    const sorted = [...daySessions].sort((a, b) => {
      if (a.startTime !== b.startTime) return a.startTime.localeCompare(b.startTime);
      return a.endTime.localeCompare(b.endTime);
    });

    const clusters: Session[][] = [];
    let currentCluster: Session[] = [];
    let clusterEnd = '';

    for (const session of sorted) {
      if (currentCluster.length === 0) {
        currentCluster.push(session);
        clusterEnd = session.endTime;
      } else if (session.startTime < clusterEnd) {
        currentCluster.push(session);
        if (session.endTime > clusterEnd) clusterEnd = session.endTime;
      } else {
        clusters.push(currentCluster);
        currentCluster = [session];
        clusterEnd = session.endTime;
      }
    }
    if (currentCluster.length > 0) clusters.push(currentCluster);

    const maxColumns = 3;
    const slots: RenderSessionSlot[] = [];
    const overflowsMap = new Map<string, Session[]>();

    for (const cluster of clusters) {
      const columns: Session[][] = [];

      for (const session of cluster) {
        let placed = false;
        for (let i = 0; i < columns.length; i++) {
          const col = columns[i];
          const lastInCol = col[col.length - 1];
          if (session.startTime >= lastInCol.endTime) {
            col.push(session);
            placed = true;
            break;
          }
        }
        if (!placed) columns.push([session]);
      }

      if (columns.length > maxColumns) {
        for (let i = 0; i < 2; i++) {
          for (const session of columns[i]) {
            slots.push({ session, width: 100 / maxColumns, left: (i * 100) / maxColumns });
          }
        }
        for (let i = 2; i < columns.length; i++) {
          for (const session of columns[i]) {
            const timeKey = session.startTime;
            if (!overflowsMap.has(timeKey)) overflowsMap.set(timeKey, []);
            overflowsMap.get(timeKey)!.push(session);
          }
        }
      } else {
        const colCount = columns.length;
        for (let i = 0; i < colCount; i++) {
          for (const session of columns[i]) {
            slots.push({ session, width: 100 / colCount, left: (i * 100) / colCount });
          }
        }
      }
    }

    const overflows = Array.from(overflowsMap.entries()).map(([startTime, sessions]) => ({
      startTime,
      count: sessions.length,
      sessions,
    }));

    return { slots, overflows };
  }

  protected isTodayDate(day: Date): boolean {
    return isToday(day);
  }

  protected dayOfWeekLabel(day: Date): string {
    return format(day, 'EEE', { locale: zhTW });
  }

  protected dayOfMonthLabel(day: Date): string {
    return format(day, 'd');
  }

  protected isHourMark(slot: string): boolean {
    return slot.endsWith(':00');
  }

  protected onOverflowClick(startTime: string, sessions: Session[]): void {
    this.overflowClick.emit({ startTime, sessions });
  }
}
