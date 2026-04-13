import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TecnicosRegistradosComponent } from './tecnicos-registrados.component';

describe('TecnicosRegistradosComponent', () => {
  let component: TecnicosRegistradosComponent;
  let fixture: ComponentFixture<TecnicosRegistradosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TecnicosRegistradosComponent]
    });
    fixture = TestBed.createComponent(TecnicosRegistradosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
