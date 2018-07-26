import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SensorMovementComponent } from './sensor-movement.component';

describe('SensorMovementComponent', () => {
  let component: SensorMovementComponent;
  let fixture: ComponentFixture<SensorMovementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SensorMovementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SensorMovementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
