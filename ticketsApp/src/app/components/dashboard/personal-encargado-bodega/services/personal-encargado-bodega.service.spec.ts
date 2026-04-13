import { TestBed } from '@angular/core/testing';

import { PersonalEncargadoBodegaService } from './personal-encargado-bodega.service';

describe('PersonalEncargadoBodegaService', () => {
  let service: PersonalEncargadoBodegaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PersonalEncargadoBodegaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
