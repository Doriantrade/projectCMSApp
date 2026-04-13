import { TestBed } from '@angular/core/testing';

import { FormularioRegistroProblemasService } from './formulario-registro-problemas.service';

describe('FormularioRegistroProblemasService', () => {
  let service: FormularioRegistroProblemasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormularioRegistroProblemasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
