import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalEncargadoBodegaComponent } from './personal-encargado-bodega.component';

describe('PersonalEncargadoBodegaComponent', () => {
  let component: PersonalEncargadoBodegaComponent;
  let fixture: ComponentFixture<PersonalEncargadoBodegaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PersonalEncargadoBodegaComponent]
    });
    fixture = TestBed.createComponent(PersonalEncargadoBodegaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
