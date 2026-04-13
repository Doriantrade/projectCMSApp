import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAsignMaqtecnicoComponent } from './modal-asign-maqtecnico.component';

describe('ModalAsignMaqtecnicoComponent', () => {
  let component: ModalAsignMaqtecnicoComponent;
  let fixture: ComponentFixture<ModalAsignMaqtecnicoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalAsignMaqtecnicoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalAsignMaqtecnicoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
