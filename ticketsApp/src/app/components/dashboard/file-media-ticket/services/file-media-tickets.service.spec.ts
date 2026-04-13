import { TestBed } from '@angular/core/testing';

import { FileMediaTicketsService } from './file-media-tickets.service';

describe('FileMediaTicketsService', () => {
  let service: FileMediaTicketsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileMediaTicketsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
