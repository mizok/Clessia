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
import { MultiSelectModule } from 'primeng/multiselect';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import type { Campus } from '@core/campuses.service';
import type { Course } from '@core/courses.service';
import type { Session } from '@core/sessions.service';
import type { Staff } from '@core/staff.service';

export interface MobileFilterDialogData {
  readonly campuses: Campus[];
  readonly courses: Course[];
  readonly teachers: Staff[];
  readonly sessions: Session[];
  readonly classes: Array<{ id: string; name: string; courseId: string; campusId: string }>;
  readonly selectedCampusId: string | null;
  readonly selectedCourseId: string | null;
  readonly selectedTeacherIds: string[];
  readonly selectedClassId: string | null;
}

export interface MobileFilterDialogResult {
  readonly campusId: string | null;
  readonly courseId: string | null;
  readonly teacherIds: string[];
  readonly classId: string | null;
}

@Component({
  selector: 'app-mobile-filter-dialog',
  imports: [FormsModule, ButtonModule, SelectModule, MultiSelectModule],
  templateUrl: './mobile-filter-dialog.component.html',
  styleUrl: './mobile-filter-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileFilterDialogComponent implements OnInit {
  private readonly config = inject(DynamicDialogConfig<MobileFilterDialogData>);
  private readonly ref = inject(DynamicDialogRef);

  protected readonly campuses = signal<Campus[]>([]);
  private readonly allCourses = signal<Course[]>([]);
  private readonly allTeachers = signal<Staff[]>([]);
  private readonly allSessions = signal<Session[]>([]);
  private readonly allClasses = signal<
    Array<{ id: string; name: string; courseId: string; campusId: string }>
  >([]);

  protected readonly selectedCampusId = signal<string | null>(null);
  protected readonly selectedCourseId = signal<string | null>(null);
  protected readonly selectedTeacherIds = signal<string[]>([]);
  protected readonly selectedClassId = signal<string | null>(null);

  protected readonly availableCourses = computed(() => {
    const campusId = this.selectedCampusId();
    if (!campusId) return [];
    return this.allCourses().filter((c) => c.campusId === campusId);
  });

  protected readonly availableTeachers = computed(() => {
    const campusId = this.selectedCampusId();
    if (!campusId) return [];
    let filtered = this.allTeachers().filter((t) => t.campusIds.includes(campusId));
    const courseId = this.selectedCourseId();
    if (courseId) {
      const course = this.allCourses().find((c) => c.id === courseId);
      if (course) {
        filtered = filtered.filter((t) => t.subjectIds.includes(course.subjectId));
      }

      const assignedTeacherIds = new Set(
        this.allSessions()
          .filter(
            (session) =>
              session.campusId === campusId &&
              session.courseId === courseId &&
              session.assignmentStatus === 'assigned' &&
              !!session.teacherId,
          )
          .map((session) => session.teacherId)
          .filter((teacherId): teacherId is string => !!teacherId),
      );
      filtered = filtered.filter((teacher) => assignedTeacherIds.has(teacher.id));
    }
    return filtered;
  });

  protected readonly availableClasses = computed(() => {
    const campusId = this.selectedCampusId();
    const courseId = this.selectedCourseId();
    if (!campusId || !courseId) return [];
    return this.allClasses().filter((c) => c.campusId === campusId && c.courseId === courseId);
  });

  protected readonly hasActiveFilters = computed(
    () =>
      !!(this.selectedCourseId() || this.selectedTeacherIds().length > 0 || this.selectedClassId()),
  );

  ngOnInit(): void {
    const data = this.config.data;
    if (!data) return;
    this.campuses.set(data.campuses);
    this.allCourses.set(data.courses);
    this.allTeachers.set(data.teachers);
    this.allSessions.set(data.sessions);
    this.allClasses.set(data.classes);
    this.selectedCampusId.set(data.selectedCampusId);
    this.selectedCourseId.set(data.selectedCourseId);
    this.selectedTeacherIds.set([...data.selectedTeacherIds]);
    this.selectedClassId.set(data.selectedClassId);
  }

  protected onCampusChange(campusValue: string | Campus | null): void {
    this.selectedCampusId.set(this.toId(campusValue));
    this.selectedCourseId.set(null);
    this.selectedTeacherIds.set([]);
    this.selectedClassId.set(null);
  }

  protected onCourseChange(courseValue: string | Course | null): void {
    this.selectedCourseId.set(this.toId(courseValue));
    this.selectedTeacherIds.set([]);
    this.selectedClassId.set(null);
  }

  protected onTeacherIdsChange(ids: readonly (string | Staff)[]): void {
    this.selectedTeacherIds.set(this.normalizeIdList(ids));
  }

  protected onClassChange(
    classValue: string | { readonly id: string; readonly name: string } | null,
  ): void {
    this.selectedClassId.set(this.toId(classValue));
  }

  protected clearFilters(): void {
    this.selectedCourseId.set(null);
    this.selectedTeacherIds.set([]);
    this.selectedClassId.set(null);
  }

  protected apply(): void {
    const result: MobileFilterDialogResult = {
      campusId: this.selectedCampusId(),
      courseId: this.selectedCourseId(),
      teacherIds: this.selectedTeacherIds(),
      classId: this.selectedClassId(),
    };
    this.ref.close(result);
  }

  private toId(value: unknown): string | null {
    if (typeof value === 'string') {
      return value.trim().length > 0 ? value : null;
    }
    if (
      value &&
      typeof value === 'object' &&
      'id' in value &&
      typeof (value as { id: unknown }).id === 'string'
    ) {
      const id = (value as { id: string }).id.trim();
      return id.length > 0 ? id : null;
    }
    return null;
  }

  private normalizeIdList(values: readonly unknown[]): string[] {
    const ids = values
      .map((value) => this.toId(value))
      .filter((id): id is string => id !== null);

    return Array.from(new Set(ids));
  }
}
