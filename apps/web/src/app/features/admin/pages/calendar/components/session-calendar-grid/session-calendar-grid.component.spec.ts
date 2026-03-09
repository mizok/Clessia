import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionCalendarGridComponent } from './session-calendar-grid.component';

describe('SessionCalendarGridComponent', () => {
  let component: SessionCalendarGridComponent;
  let fixture: ComponentFixture<SessionCalendarGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionCalendarGridComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SessionCalendarGridComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('currentDate', new Date('2026-03-07T00:00:00.000Z'));
    fixture.componentRef.setInput('weekDays', [new Date('2026-03-02T00:00:00.000Z')]);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
