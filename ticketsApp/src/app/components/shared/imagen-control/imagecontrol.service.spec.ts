import { TestBed } from '@angular/core/testing';

import { ImagecontrolService } from './imagecontrol.service';

describe('ImagecontrolService', () => {
  let service: ImagecontrolService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImagecontrolService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
