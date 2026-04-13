import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCronogramaComponent } from './modal-cronograma.component';

describe('ModalCronogramaComponent', () => {
  let component: ModalCronogramaComponent;
  let fixture: ComponentFixture<ModalCronogramaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalCronogramaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalCronogramaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
