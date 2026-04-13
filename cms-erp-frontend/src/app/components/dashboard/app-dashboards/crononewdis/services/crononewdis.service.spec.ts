import { TestBed } from '@angular/core/testing';

import { CrononewdisService } from './crononewdis.service';

describe('CrononewdisService', () => {
  let service: CrononewdisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CrononewdisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
