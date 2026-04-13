import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileMediaTicketComponent } from './file-media-ticket.component';

describe('FileMediaTicketComponent', () => {
  let component: FileMediaTicketComponent;
  let fixture: ComponentFixture<FileMediaTicketComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FileMediaTicketComponent]
    });
    fixture = TestBed.createComponent(FileMediaTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
