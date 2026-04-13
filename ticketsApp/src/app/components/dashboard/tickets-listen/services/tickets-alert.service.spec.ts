import { TestBed } from '@angular/core/testing';

import { TicketsAlertService } from './tickets-alert.service';

describe('TicketsAlertService', () => {
  let service: TicketsAlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TicketsAlertService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
