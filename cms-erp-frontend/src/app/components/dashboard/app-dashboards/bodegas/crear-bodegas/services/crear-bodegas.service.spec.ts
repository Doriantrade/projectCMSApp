import { TestBed } from '@angular/core/testing';

import { CrearBodegasService } from './crear-bodegas.service';

describe('CrearBodegasService', () => {
  let service: CrearBodegasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CrearBodegasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
