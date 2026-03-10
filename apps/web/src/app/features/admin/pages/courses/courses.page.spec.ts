import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { CoursesPage } from './courses.page';
import { CoursesService } from '@core/courses.service';
import { CampusesService } from '@core/campuses.service';
import { SubjectsService } from '@core/subjects.service';
import { OverlayContainerService } from '@core/overlay-container.service';

describe('CoursesPage', () => {
  let component: CoursesPage;
  let fixture: ComponentFixture<CoursesPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoursesPage],
      providers: [
        {
          provide: CoursesService,
          useValue: {
            list: vi.fn(() => of({ data: [] })),
            delete: vi.fn(),
          },
        },
        {
          provide: CampusesService,
          useValue: {
            list: vi.fn(() => of({ data: [] })),
          },
        },
        {
          provide: SubjectsService,
          useValue: {
            list: vi.fn(() => of({ data: [] })),
          },
        },
        { provide: OverlayContainerService, useValue: { getContainer: () => null } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CoursesPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
