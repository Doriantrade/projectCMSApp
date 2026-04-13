import { TestBed } from '@angular/core/testing';

import { KardexTransferenciasService } from './kardex-transferencias.service';

describe('KardexTransferenciasService', () => {
  let service: KardexTransferenciasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KardexTransferenciasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
