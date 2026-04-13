import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MensajeriaTicketComponent } from './mensajeria-ticket.component';

describe('MensajeriaTicketComponent', () => {
  let component: MensajeriaTicketComponent;
  let fixture: ComponentFixture<MensajeriaTicketComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MensajeriaTicketComponent]
    });
    fixture = TestBed.createComponent(MensajeriaTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
