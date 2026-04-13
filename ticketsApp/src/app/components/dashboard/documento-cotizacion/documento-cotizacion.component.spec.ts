import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocuemntoCotizacionComponent } from './documento-cotizacion.component';

describe('DocuemntoCotizacionComponent', () => {
  let component: DocuemntoCotizacionComponent;
  let fixture: ComponentFixture<DocuemntoCotizacionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DocuemntoCotizacionComponent]
    });
    fixture = TestBed.createComponent(DocuemntoCotizacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
