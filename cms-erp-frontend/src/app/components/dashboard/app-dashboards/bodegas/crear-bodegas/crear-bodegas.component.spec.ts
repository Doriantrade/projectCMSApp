import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearBodegasComponent } from './crear-bodegas.component';

describe('CrearBodegasComponent', () => {
  let component: CrearBodegasComponent;
  let fixture: ComponentFixture<CrearBodegasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrearBodegasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearBodegasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
