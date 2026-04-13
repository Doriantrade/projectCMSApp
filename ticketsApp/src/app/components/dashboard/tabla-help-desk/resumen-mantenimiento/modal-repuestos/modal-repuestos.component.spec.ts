import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalRepuestosComponent } from './modal-repuestos.component';

describe('ModalRepuestosComponent', () => {
  let component: ModalRepuestosComponent;
  let fixture: ComponentFixture<ModalRepuestosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModalRepuestosComponent]
    });
    fixture = TestBed.createComponent(ModalRepuestosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
