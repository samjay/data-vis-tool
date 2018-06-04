import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TunnelNetworkComponent } from './tunnel-network.component';

describe('TunnelNetworkComponent', () => {
  let component: TunnelNetworkComponent;
  let fixture: ComponentFixture<TunnelNetworkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TunnelNetworkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TunnelNetworkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
