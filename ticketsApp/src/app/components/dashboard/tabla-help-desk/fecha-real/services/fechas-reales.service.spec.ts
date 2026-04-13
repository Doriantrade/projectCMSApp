import { TestBed } from '@angular/core/testing';

import { FechasRealesService } from './fechas-reales.service';

describe('FechasRealesService', () => {
  let service: FechasRealesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FechasRealesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
