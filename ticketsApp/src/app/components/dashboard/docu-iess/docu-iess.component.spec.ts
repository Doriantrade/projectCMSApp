import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocuIESSComponent } from './docu-iess.component';

describe('DocuIESSComponent', () => {
  let component: DocuIESSComponent;
  let fixture: ComponentFixture<DocuIESSComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DocuIESSComponent]
    });
    fixture = TestBed.createComponent(DocuIESSComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
