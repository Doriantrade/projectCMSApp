import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResumenMantenimientoComponent } from './resumen-mantenimiento.component';

describe('ResumenMantenimientoComponent', () => {
  let component: ResumenMantenimientoComponent;
  let fixture: ComponentFixture<ResumenMantenimientoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ResumenMantenimientoComponent]
    });
    fixture = TestBed.createComponent(ResumenMantenimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
