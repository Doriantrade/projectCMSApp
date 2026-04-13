import { TestBed } from '@angular/core/testing';

import { MachineAllDetailsService } from './machine-all-details.service';

describe('MachineAllDetailsService', () => {
  let service: MachineAllDetailsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MachineAllDetailsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
