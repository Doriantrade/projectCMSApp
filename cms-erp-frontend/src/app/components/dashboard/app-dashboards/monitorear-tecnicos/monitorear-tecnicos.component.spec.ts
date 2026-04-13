import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitorearTecnicosComponent } from './monitorear-tecnicos.component';

describe('MonitorearTecnicosComponent', () => {
  let component: MonitorearTecnicosComponent;
  let fixture: ComponentFixture<MonitorearTecnicosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MonitorearTecnicosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MonitorearTecnicosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
