import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalPreviewComponent } from './modal-preview.component';

describe('ModalPreviewComponent', () => {
  let component: ModalPreviewComponent;
  let fixture: ComponentFixture<ModalPreviewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModalPreviewComponent]
    });
    fixture = TestBed.createComponent(ModalPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
