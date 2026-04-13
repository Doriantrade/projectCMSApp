import { TestBed } from '@angular/core/testing';

import { CronogramaService } from './cronograma.service';

describe('CronogramaService', () => {
  let service: CronogramaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CronogramaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
