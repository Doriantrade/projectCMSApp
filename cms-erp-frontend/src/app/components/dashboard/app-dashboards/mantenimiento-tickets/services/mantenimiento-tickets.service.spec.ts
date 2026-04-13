import { TestBed } from '@angular/core/testing';

import { MantenimientoTicketsService } from './mantenimiento-tickets.service';

describe('MantenimientoTicketsService', () => {
  let service: MantenimientoTicketsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MantenimientoTicketsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
