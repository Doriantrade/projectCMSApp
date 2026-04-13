import { TestBed } from '@angular/core/testing';

import { MasterTableService } from './master-table.service';

describe('MasterTableService', () => {
  let service: MasterTableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MasterTableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
