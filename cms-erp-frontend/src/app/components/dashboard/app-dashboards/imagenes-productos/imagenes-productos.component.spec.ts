import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImagenesProductosComponent } from './imagenes-productos.component';

describe('ImagenesProductosComponent', () => {
  let component: ImagenesProductosComponent;
  let fixture: ComponentFixture<ImagenesProductosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImagenesProductosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImagenesProductosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
