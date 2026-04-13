import { TestBed } from '@angular/core/testing';

import { MantenimientoCronogramaService } from './mantenimiento-cronograma.service';

describe('MantenimientoCronogramaService', () => {
  let service: MantenimientoCronogramaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MantenimientoCronogramaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
