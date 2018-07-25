import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScaleLegendComponent } from './scale-legend.component';

describe('ScaleLegendComponent', () => {
  let component: ScaleLegendComponent;
  let fixture: ComponentFixture<ScaleLegendComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScaleLegendComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScaleLegendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
