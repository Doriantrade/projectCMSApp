import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreadorMarcaRepuestoComponent } from './creador-marca-repuesto.component';

describe('CreadorMarcaRepuestoComponent', () => {
  let component: CreadorMarcaRepuestoComponent;
  let fixture: ComponentFixture<CreadorMarcaRepuestoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreadorMarcaRepuestoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreadorMarcaRepuestoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
