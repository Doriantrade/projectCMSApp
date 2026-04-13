import { TestBed } from '@angular/core/testing';

import { ClientesHelpDeskService } from './clientes-help-desk.service';

describe('ClientesHelpDeskService', () => {
  let service: ClientesHelpDeskService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClientesHelpDeskService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
