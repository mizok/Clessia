import { Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { MultiSelectModule } from 'primeng/multiselect';
import type { Campus } from '@core/campuses.service';
import type { Course } from '@core/courses.service';
import type { Staff } from '@core/staff.service';

export const UNASSIGNED_TEACHER_ID = '__unassigned__';

export const SESSION_STATUS_OPTIONS: Array<{ label: string; value: string }> = [
  { label: '已排課', value: 'scheduled' },
  { label: '已完成', value: 'completed' },
  { label: '已停課', value: 'cancelled' },
];

export const ALL_SESSION_STATUSES = SESSION_STATUS_OPTIONS.map((option) => option.value);
export const DEFAULT_STATUSES = ['scheduled', 'completed'];

export interface TeacherSelectOption {
  readonly id: string;
  readonly displayName: string;
  readonly subjectNames?: string[];
}

export interface TeacherOptionGroup {
  readonly label: string;
  readonly items: TeacherSelectOption[];
}

export interface SessionFilterClassOption {
  readonly id: string;
  readonly name: string;
  readonly courseId: string;
  readonly campusId: string;
}

interface SessionFilterClassDisplayOption extends SessionFilterClassOption {
  readonly courseName: string | null;
  readonly campusName: string | null;
}

@Component({
  selector: 'app-session-filters',
  imports: [FormsModule, ButtonModule, DatePickerModule, MultiSelectModule],
  templateUrl: './session-filters.component.html',
  styleUrl: './session-filters.component.scss',
})
export class SessionFiltersComponent {
  readonly listDateRange = input<Date[]>([]);

  readonly campuses = input<Campus[]>([]);
  readonly availableCourses = input<Course[]>([]);
  readonly availableTeachers = input<Staff[]>([]);
  readonly availableClasses = input<SessionFilterClassOption[]>([]);

  readonly selectedCampusIds = input<string[]>([]);
  readonly selectedCourseIds = input<string[]>([]);
  readonly selectedTeacherIds = input<string[]>([]);
  readonly selectedClassIds = input<string[]>([]);
  readonly selectedStatuses = input<string[]>(DEFAULT_STATUSES);

  readonly activeFilterCount = input(0);
  readonly hasActiveFilters = input(false);

  readonly listDateRangeChange = output<Date[]>();
  readonly mobileFilterToggle = output<void>();
  readonly campusIdsChange = output<string[]>();
  readonly courseIdsChange = output<string[]>();
  readonly teacherIdsChange = output<string[]>();
  readonly classIdsChange = output<string[]>();
  readonly statusesChange = output<string[]>();
  readonly clearFilters = output<void>();

  protected readonly statusOptions = SESSION_STATUS_OPTIONS;

  protected readonly teacherOptionGroups = computed<TeacherOptionGroup[]>(() => {
    const groups: TeacherOptionGroup[] = [
      { label: '篩選', items: [{ id: UNASSIGNED_TEACHER_ID, displayName: '未指派' }] },
    ];
    const teachers = this.filteredTeachers();
    if (teachers.length > 0) {
      groups.push({ label: '老師', items: teachers });
    }
    return groups;
  });

  protected readonly filteredTeachers = computed<Staff[]>(() => {
    const teachers = this.availableTeachers();
    const courseIds = this.selectedCourseIds();
    if (courseIds.length === 0) return teachers;

    const selectedCourses = this.availableCourses().filter((c) => courseIds.includes(c.id));
    if (selectedCourses.length === 0) return teachers;

    const subjectIds = new Set(selectedCourses.map((c) => c.subjectId));
    return teachers.filter((t) => t.subjectIds.some((sid) => subjectIds.has(sid)));
  });

  protected readonly campusNameById = computed(
    () => new Map(this.campuses().map((campus) => [campus.id, campus.name])),
  );
  protected readonly courseNameById = computed(
    () => new Map(this.availableCourses().map((course) => [course.id, course.name])),
  );
  protected readonly classDisplayOptions = computed<SessionFilterClassDisplayOption[]>(() =>
    this.availableClasses().map((classOption) => ({
      ...classOption,
      courseName: this.courseNameById().get(classOption.courseId) ?? null,
      campusName: this.campusNameById().get(classOption.campusId) ?? null,
    })),
  );

  protected onListDateRangeChange(range: Date[]): void {
    this.listDateRangeChange.emit(range);
  }

  protected onCampusMultiChange(ids: readonly (string | Campus)[]): void {
    this.campusIdsChange.emit(this.normalizeIdList(ids));
  }

  protected onCourseMultiChange(ids: readonly (string | Course)[]): void {
    this.courseIdsChange.emit(this.normalizeIdList(ids));
  }

  protected onTeacherMultiChange(ids: readonly (string | Staff)[]): void {
    this.teacherIdsChange.emit(this.normalizeIdList(ids));
  }

  protected onClassMultiChange(values: readonly (string | SessionFilterClassOption)[]): void {
    this.classIdsChange.emit(this.normalizeIdList(values));
  }

  protected onStatusesChange(values: string[] | null): void {
    this.statusesChange.emit(values ?? []);
  }

  protected getCourseCampusName(course: Course): string | null {
    return course.campusName ?? this.campusNameById().get(course.campusId) ?? null;
  }

  protected getTeacherSubjectLabel(teacher: TeacherSelectOption): string | null {
    if (!teacher.subjectNames || teacher.subjectNames.length === 0) {
      return null;
    }
    return teacher.subjectNames.join('、');
  }

  protected getClassMetaLabel(classOption: SessionFilterClassDisplayOption): string | null {
    const parts = [classOption.courseName, classOption.campusName].filter(
      (value): value is string => !!value,
    );
    return parts.length > 0 ? parts.join(' · ') : null;
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
