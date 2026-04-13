import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MachineDetailsAllComponent } from './machine-details-all.component';

describe('MachineDetailsAllComponent', () => {
  let component: MachineDetailsAllComponent;
  let fixture: ComponentFixture<MachineDetailsAllComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MachineDetailsAllComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MachineDetailsAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
