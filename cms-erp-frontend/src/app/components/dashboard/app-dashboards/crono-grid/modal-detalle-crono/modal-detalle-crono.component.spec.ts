import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDetalleCronoComponent } from './modal-detalle-crono.component';

describe('ModalDetalleCronoComponent', () => {
  let component: ModalDetalleCronoComponent;
  let fixture: ComponentFixture<ModalDetalleCronoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalDetalleCronoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalDetalleCronoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
