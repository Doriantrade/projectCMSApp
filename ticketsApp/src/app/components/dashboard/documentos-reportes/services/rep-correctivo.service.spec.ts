import { TestBed } from '@angular/core/testing';

import { RepCorrectivoService } from './rep-correctivo.service';

describe('RepCorrectivoService', () => {
  let service: RepCorrectivoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RepCorrectivoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
