import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignModUserComponent } from './asign-mod-user.component';

describe('AsignModUserComponent', () => {
  let component: AsignModUserComponent;
  let fixture: ComponentFixture<AsignModUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AsignModUserComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AsignModUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
