import { TestBed } from '@angular/core/testing';

import { RepuestosService } from './repuestos.service';

describe('RepuestosService', () => {
  let service: RepuestosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RepuestosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
