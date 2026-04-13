import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAsignacionProductosComponent } from './modal-asignacion-productos.component';

describe('ModalAsignacionProductosComponent', () => {
  let component: ModalAsignacionProductosComponent;
  let fixture: ComponentFixture<ModalAsignacionProductosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalAsignacionProductosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalAsignacionProductosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
