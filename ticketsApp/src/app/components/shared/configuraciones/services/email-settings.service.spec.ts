import { TestBed } from '@angular/core/testing';

import { EmailSettingsService } from './email-settings.service';

describe('EmailSettingsService', () => {
  let service: EmailSettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmailSettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
