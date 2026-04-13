import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfiguracionesComponent } from './configuraciones.component';

describe('ConfiguracionesComponent', () => {
  let component: ConfiguracionesComponent;
  let fixture: ComponentFixture<ConfiguracionesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConfiguracionesComponent]
    });
    fixture = TestBed.createComponent(ConfiguracionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
