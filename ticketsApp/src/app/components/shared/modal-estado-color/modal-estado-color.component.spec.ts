import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalEstadoColorComponent } from './modal-estado-color.component';

describe('ModalEstadoColorComponent', () => {
  let component: ModalEstadoColorComponent;
  let fixture: ComponentFixture<ModalEstadoColorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModalEstadoColorComponent]
    });
    fixture = TestBed.createComponent(ModalEstadoColorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
