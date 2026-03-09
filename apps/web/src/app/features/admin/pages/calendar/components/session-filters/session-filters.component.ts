import { Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import type { Campus } from '@core/campuses.service';
import type { Course } from '@core/courses.service';
import type { Staff } from '@core/staff.service';

export interface SessionFilterClassOption {
  readonly id: string;
  readonly name: string;
  readonly courseId: string;
  readonly campusId: string;
}

@Component({
  selector: 'app-session-filters',
  imports: [FormsModule, ButtonModule, DatePickerModule, MultiSelectModule, SelectModule],
  templateUrl: './session-filters.component.html',
  styleUrl: './session-filters.component.scss',
})
export class SessionFiltersComponent {
  readonly viewMode = input<'calendar' | 'list'>('calendar');
  readonly listDateRange = input<Date[]>([]);

  readonly campuses = input<Campus[]>([]);
  readonly availableCourses = input<Course[]>([]);
  readonly availableTeachers = input<Staff[]>([]);
  readonly availableClasses = input<SessionFilterClassOption[]>([]);

  readonly selectedCampusId = input<string | null>(null);
  readonly selectedCourseId = input<string | null>(null);
  readonly selectedTeacherIds = input<string[]>([]);
  readonly selectedClassId = input<string | null>(null);

  readonly activeFilterCount = input(0);
  readonly hasActiveFilters = input(false);

  readonly listDateRangeChange = output<Date[]>();
  readonly mobileFilterToggle = output<void>();
  readonly campusChange = output<string | null>();
  readonly courseChange = output<string | null>();
  readonly teacherIdsChange = output<string[]>();
  readonly classChange = output<string | null>();
  readonly clearFilters = output<void>();

  protected readonly singleTeacherId = computed<string | null>(() => {
    const ids = this.selectedTeacherIds();
    return ids.length > 0 ? ids[0] : null;
  });

  protected readonly filteredTeachers = computed<Staff[]>(() => {
    const teachers = this.availableTeachers();
    const selectedCourseId = this.selectedCourseId();
    if (!selectedCourseId) {
      return teachers;
    }

    const selectedCourse = this.availableCourses().find((course) => course.id === selectedCourseId);
    if (!selectedCourse) {
      return teachers;
    }

    return teachers.filter((teacher) => teacher.subjectIds.includes(selectedCourse.subjectId));
  });

  protected onListDateRangeChange(range: Date[]): void {
    this.listDateRangeChange.emit(range);
  }

  protected onCampusSelectChange(value: string | Campus | null): void {
    this.campusChange.emit(this.toId(value));
  }

  protected onCourseSelectChange(value: string | Course | null): void {
    this.courseChange.emit(this.toId(value));
  }

  protected onTeacherSingleChange(teacherId: string | null): void {
    this.teacherIdsChange.emit(this.normalizeIdList(teacherId ? [teacherId] : []));
  }

  protected onTeacherMultiChange(teacherIds: readonly (string | Staff)[]): void {
    this.teacherIdsChange.emit(this.normalizeIdList(teacherIds));
  }

  protected onClassSelectChange(value: string | SessionFilterClassOption | null): void {
    this.classChange.emit(this.toId(value));
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
