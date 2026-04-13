import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FechaRealComponent } from './fecha-real.component';

describe('FechaRealComponent', () => {
  let component: FechaRealComponent;
  let fixture: ComponentFixture<FechaRealComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FechaRealComponent]
    });
    fixture = TestBed.createComponent(FechaRealComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
