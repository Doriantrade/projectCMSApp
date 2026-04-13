import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignacionProvinciasComponent } from './asignacion-provincias.component';

describe('AsignacionProvinciasComponent', () => {
  let component: AsignacionProvinciasComponent;
  let fixture: ComponentFixture<AsignacionProvinciasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AsignacionProvinciasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AsignacionProvinciasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
