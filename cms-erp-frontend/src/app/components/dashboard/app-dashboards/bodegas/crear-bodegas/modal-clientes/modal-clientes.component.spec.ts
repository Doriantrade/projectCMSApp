import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalClientesComponent } from './modal-clientes.component';

describe('ModalClientesComponent', () => {
  let component: ModalClientesComponent;
  let fixture: ComponentFixture<ModalClientesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalClientesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalClientesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
