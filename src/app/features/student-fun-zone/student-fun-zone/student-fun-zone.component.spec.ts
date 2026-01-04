import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentFunZoneComponent } from './student-fun-zone.component';

describe('StudentFunZoneComponent', () => {
  let component: StudentFunZoneComponent;
  let fixture: ComponentFixture<StudentFunZoneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentFunZoneComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentFunZoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
