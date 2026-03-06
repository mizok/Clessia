import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import {
  SessionsService,
  type BatchAssignResult,
  type BatchActionResult,
} from '@core/sessions.service';
import type { Staff } from '@core/staff.service';

type BatchMode = 'assign' | 'time' | 'cancel' | 'uncancel';

export interface MobileBatchDialogData {
  readonly sessionIds: string[];
  readonly selectedCount: number;
  readonly teachers: Staff[];
}

export interface MobileBatchDialogResult {
  readonly action: 'applied';
  readonly updated: number;
}

@Component({
  selector: 'app-mobile-batch-dialog',
  imports: [FormsModule, ButtonModule, SelectModule, InputTextModule],
  templateUrl: './mobile-batch-dialog.component.html',
  styleUrl: './mobile-batch-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileBatchDialogComponent implements OnInit {
  private readonly config = inject(DynamicDialogConfig<MobileBatchDialogData>);
  private readonly ref = inject(DynamicDialogRef);
  private readonly sessionsService = inject(SessionsService);
  private readonly messageService = inject(MessageService);

  protected readonly teachers = signal<Staff[]>([]);
  protected readonly sessionIds = signal<string[]>([]);
  protected readonly selectedCount = signal(0);

  protected readonly batchMode = signal<BatchMode | null>(null);
  protected readonly batchTeacherId = signal<string | null>(null);
  protected readonly batchStartTime = signal('09:00');
  protected readonly batchEndTime = signal('11:00');
  protected readonly batchCancelReason = signal('');
  protected readonly batchPreview = signal<BatchAssignResult | BatchActionResult | null>(null);
  protected readonly batchLoading = signal(false);

  protected readonly processableCount = computed(() => {
    const preview = this.batchPreview();
    if (!preview) return 0;
    if ('skippedConflicts' in preview) return preview.updated;
    return preview.processableIds.length;
  });

  protected readonly skippedCount = computed(() => {
    const preview = this.batchPreview();
    if (!preview) return 0;
    if ('skippedConflicts' in preview) return preview.skippedConflicts + preview.skippedNotEligible;
    return preview.skipped;
  });

  ngOnInit(): void {
    const data = this.config.data;
    if (!data) return;
    this.sessionIds.set([...data.sessionIds]);
    this.selectedCount.set(data.selectedCount);
    this.teachers.set(data.teachers);
  }

  protected selectAction(mode: BatchMode): void {
    this.batchMode.set(mode);
    this.batchPreview.set(null);
  }

  protected goBack(): void {
    this.batchMode.set(null);
    this.batchPreview.set(null);
    this.batchTeacherId.set(null);
    this.batchCancelReason.set('');
  }

  protected runPreview(): void {
    const ids = this.sessionIds();
    if (ids.length === 0) return;
    this.batchLoading.set(true);

    const obs = this.buildObs(true);
    if (!obs) return;

    obs.subscribe({
      next: (result) => {
        this.batchPreview.set(result);
        this.batchLoading.set(false);
      },
      error: () => {
        this.batchLoading.set(false);
        this.messageService.add({ severity: 'error', summary: '預覽失敗', detail: '無法執行預覽' });
      },
    });
  }

  protected apply(): void {
    const ids = this.sessionIds();
    if (ids.length === 0) return;
    this.batchLoading.set(true);

    const obs = this.buildObs(false);
    if (!obs) return;

    obs.subscribe({
      next: (result) => {
        this.batchLoading.set(false);
        const updated = 'updated' in result ? result.updated : 0;
        this.messageService.add({
          severity: 'success',
          summary: '批次操作完成',
          detail: `已更新 ${updated} 堂課`,
        });
        this.ref.close({ action: 'applied', updated } satisfies MobileBatchDialogResult);
      },
      error: () => {
        this.batchLoading.set(false);
        this.messageService.add({ severity: 'error', summary: '操作失敗', detail: '批次操作失敗' });
      },
    });
  }

  private buildObs(
    dryRun: boolean,
  ): import('rxjs').Observable<BatchAssignResult | BatchActionResult> | null {
    const ids = this.sessionIds();
    switch (this.batchMode()) {
      case 'assign':
        return this.sessionsService.batchAssignTeacher({
          sessionIds: ids,
          teacherId: this.batchTeacherId()!,
          dryRun,
        });
      case 'time':
        return this.sessionsService.batchUpdateTime({
          sessionIds: ids,
          startTime: this.batchStartTime(),
          endTime: this.batchEndTime(),
          dryRun,
        });
      case 'cancel':
        return this.sessionsService.batchCancel({
          sessionIds: ids,
          reason: this.batchCancelReason() || undefined,
          dryRun,
        });
      case 'uncancel':
        return this.sessionsService.batchUncancel({ sessionIds: ids, dryRun });
      default:
        return null;
    }
  }
}
