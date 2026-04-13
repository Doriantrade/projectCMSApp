import { TestBed } from '@angular/core/testing';

import { MarcarepService } from './marcarep.service';

describe('MarcarepService', () => {
  let service: MarcarepService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MarcarepService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
