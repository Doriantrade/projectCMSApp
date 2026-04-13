import { TestBed } from '@angular/core/testing';

import { MensajeriaTicketService } from './mensajeria-ticket.service';

describe('MensajeriaTicketService', () => {
  let service: MensajeriaTicketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MensajeriaTicketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
