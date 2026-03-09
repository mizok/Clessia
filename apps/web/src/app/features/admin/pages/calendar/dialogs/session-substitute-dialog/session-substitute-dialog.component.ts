import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { Session, SessionsService } from '@core/sessions.service';
import { StaffService, Staff } from '@core/staff.service';
import { CoursesService } from '@core/courses.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-session-substitute-dialog',
  imports: [ReactiveFormsModule, ButtonModule, TextareaModule, SelectModule],
  templateUrl: './session-substitute-dialog.component.html',
  styleUrl: './session-substitute-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionSubstituteDialogComponent implements OnInit {
  private readonly config = inject(DynamicDialogConfig);
  private readonly ref = inject(DynamicDialogRef);
  private readonly sessionsService = inject(SessionsService);
  private readonly staffService = inject(StaffService);
  private readonly coursesService = inject(CoursesService);
  private readonly messageService = inject(MessageService);
  private readonly fb = inject(FormBuilder);

  readonly session = signal<Session | null>(null);
  readonly teachers = signal<Staff[]>([]);
  readonly loadingTeachers = signal(false);
  readonly isSubmitting = signal(false);

  readonly form = this.fb.group({
    teacherId: ['', Validators.required],
    reason: [''],
  });

  ngOnInit() {
    if (this.config.data?.session) {
      this.session.set(this.config.data.session);
    }
    this.loadTeachers();
  }

  private loadTeachers() {
    const s = this.session();
    if (!s) {
      this.teachers.set([]);
      return;
    }

    this.loadingTeachers.set(true);
    forkJoin({
      teachersRes: this.staffService.list({ role: 'teacher', campusId: s.campusId }),
      courseRes: this.coursesService.get(s.courseId),
    }).subscribe({
      next: ({ teachersRes, courseRes }) => {
        const subjectId = courseRes.data.subjectId;
        const available = teachersRes.data.filter(
          (teacher) =>
            teacher.id !== s.teacherId &&
            teacher.campusIds.includes(s.campusId) &&
            teacher.subjectIds.includes(subjectId),
        );
        this.teachers.set(available);
        this.loadingTeachers.set(false);
      },
      error: () => this.loadingTeachers.set(false),
    });
  }

  protected closeDialog(): void {
    this.ref.close();
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const s = this.session();
    if (!s) return;

    this.isSubmitting.set(true);
    const formValue = this.form.value;

    this.sessionsService
      .substitute(s.id, formValue.teacherId!, formValue.reason || undefined)
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: '成功',
            detail: '已成功安排代課',
          });
          this.ref.close('refresh');
        },
        error: (error: { error?: { error?: string } }) => {
          this.messageService.add({
            severity: 'error',
            summary: '錯誤',
            detail: error.error?.error ?? '代課安排失敗，請稍後再試',
          });
          this.isSubmitting.set(false);
        },
      });
  }
}
