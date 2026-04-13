import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepuestosAsignadosComponent } from './repuestos-asignados.component';

describe('RepuestosAsignadosComponent', () => {
  let component: RepuestosAsignadosComponent;
  let fixture: ComponentFixture<RepuestosAsignadosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RepuestosAsignadosComponent]
    });
    fixture = TestBed.createComponent(RepuestosAsignadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
