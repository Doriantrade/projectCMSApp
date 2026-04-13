import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaquinariaContratoComponent } from './maquinaria-contrato.component';

describe('MaquinariaContratoComponent', () => {
  let component: MaquinariaContratoComponent;
  let fixture: ComponentFixture<MaquinariaContratoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MaquinariaContratoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MaquinariaContratoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
