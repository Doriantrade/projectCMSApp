import { TestBed } from '@angular/core/testing';

import { DocumentoCotizacionService } from './documento-cotizacion.service';

describe('DocumentoCotizacionService', () => {
  let service: DocumentoCotizacionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocumentoCotizacionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
