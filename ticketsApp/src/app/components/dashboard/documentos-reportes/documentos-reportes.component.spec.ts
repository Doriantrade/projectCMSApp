import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentosReportesComponent } from './documentos-reportes.component';

describe('DocumentosReportesComponent', () => {
  let component: DocumentosReportesComponent;
  let fixture: ComponentFixture<DocumentosReportesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DocumentosReportesComponent]
    });
    fixture = TestBed.createComponent(DocumentosReportesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
