import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDownCotizacionComponent } from './modal-down-cotizacion.component';

describe('ModalDownCotizacionComponent', () => {
  let component: ModalDownCotizacionComponent;
  let fixture: ComponentFixture<ModalDownCotizacionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModalDownCotizacionComponent]
    });
    fixture = TestBed.createComponent(ModalDownCotizacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
