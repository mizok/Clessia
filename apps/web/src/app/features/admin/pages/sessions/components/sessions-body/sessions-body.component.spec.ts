import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionsBodyComponent } from './sessions-body.component';

describe('SessionsBodyComponent', () => {
  let component: SessionsBodyComponent;
  let fixture: ComponentFixture<SessionsBodyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionsBodyComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SessionsBodyComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
