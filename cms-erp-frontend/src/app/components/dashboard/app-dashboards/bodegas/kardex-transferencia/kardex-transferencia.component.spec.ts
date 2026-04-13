import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KardexTransferenciaComponent } from './kardex-transferencia.component';

describe('KardexTransferenciaComponent', () => {
  let component: KardexTransferenciaComponent;
  let fixture: ComponentFixture<KardexTransferenciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KardexTransferenciaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KardexTransferenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
