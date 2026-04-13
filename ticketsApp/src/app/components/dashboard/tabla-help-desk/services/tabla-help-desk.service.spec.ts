import { TestBed } from '@angular/core/testing';

import { TablaHelpDeskService } from './tabla-help-desk.service';

describe('TablaHelpDeskService', () => {
  let service: TablaHelpDeskService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TablaHelpDeskService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
