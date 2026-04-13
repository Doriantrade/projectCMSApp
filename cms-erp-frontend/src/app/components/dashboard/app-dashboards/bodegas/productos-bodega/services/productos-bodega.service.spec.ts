import { TestBed } from '@angular/core/testing';

import { ProductosBodegaService } from './productos-bodega.service';

describe('ProductosBodegaService', () => {
  let service: ProductosBodegaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductosBodegaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
