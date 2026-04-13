import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusquedaInputsComponent } from './busqueda-inputs.component';

describe('BusquedaInputsComponent', () => {
  let component: BusquedaInputsComponent;
  let fixture: ComponentFixture<BusquedaInputsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusquedaInputsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BusquedaInputsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
