import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CronoGridComponent } from './crono-grid.component';

describe('CronoGridComponent', () => {
  let component: CronoGridComponent;
  let fixture: ComponentFixture<CronoGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CronoGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CronoGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
