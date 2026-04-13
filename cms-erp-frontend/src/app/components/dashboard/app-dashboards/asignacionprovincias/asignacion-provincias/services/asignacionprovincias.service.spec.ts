import { TestBed } from '@angular/core/testing';

import { AsignacionprovinciasService } from './asignacionprovincias.service';

describe('AsignacionprovinciasService', () => {
  let service: AsignacionprovinciasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AsignacionprovinciasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
