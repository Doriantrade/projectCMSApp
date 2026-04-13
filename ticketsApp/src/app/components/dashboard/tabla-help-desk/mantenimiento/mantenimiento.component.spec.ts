import { ComponentFixture, TestBed } from '@angular/core/testing';

import MantenimientoComponent from './mantenimiento.component';

describe('MantenimientoComponent', () => {
  let component: MantenimientoComponent;
  let fixture: ComponentFixture<MantenimientoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MantenimientoComponent]
    });
    fixture = TestBed.createComponent(MantenimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
