import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MantenimientoTicketsComponent } from './mantenimiento-tickets.component';

describe('MantenimientoTicketsComponent', () => {
  let component: MantenimientoTicketsComponent;
  let fixture: ComponentFixture<MantenimientoTicketsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MantenimientoTicketsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MantenimientoTicketsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
