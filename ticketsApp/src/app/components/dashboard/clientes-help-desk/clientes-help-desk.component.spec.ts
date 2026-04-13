import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientesHelpDeskComponent } from './clientes-help-desk.component';

describe('ClientesHelpDeskComponent', () => {
  let component: ClientesHelpDeskComponent;
  let fixture: ComponentFixture<ClientesHelpDeskComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ClientesHelpDeskComponent]
    });
    fixture = TestBed.createComponent(ClientesHelpDeskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
