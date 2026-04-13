import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioRegistroProblemasComponent } from './formulario-registro-problemas.component';

describe('FormularioRegistroProblemasComponent', () => {
  let component: FormularioRegistroProblemasComponent;
  let fixture: ComponentFixture<FormularioRegistroProblemasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FormularioRegistroProblemasComponent]
    });
    fixture = TestBed.createComponent(FormularioRegistroProblemasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
