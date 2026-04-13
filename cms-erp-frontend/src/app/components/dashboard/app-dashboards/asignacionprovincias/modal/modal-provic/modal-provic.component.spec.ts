import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalProvicComponent } from './modal-provic.component';

describe('ModalProvicComponent', () => {
  let component: ModalProvicComponent;
  let fixture: ComponentFixture<ModalProvicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalProvicComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalProvicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
