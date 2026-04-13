import { TestBed } from '@angular/core/testing';

import { NavsideService } from './navside.service';

describe('NavsideService', () => {
  let service: NavsideService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NavsideService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
