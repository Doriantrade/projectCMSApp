import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketsListenComponent } from './tickets-listen.component';

describe('TicketsListenComponent', () => {
  let component: TicketsListenComponent;
  let fixture: ComponentFixture<TicketsListenComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TicketsListenComponent]
    });
    fixture = TestBed.createComponent(TicketsListenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
