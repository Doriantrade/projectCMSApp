import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrononewdisComponent } from './crononewdis.component';

describe('CrononewdisComponent', () => {
  let component: CrononewdisComponent;
  let fixture: ComponentFixture<CrononewdisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrononewdisComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrononewdisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
