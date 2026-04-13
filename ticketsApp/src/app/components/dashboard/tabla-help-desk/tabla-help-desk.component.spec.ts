import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablaHelpDeskComponent } from './tabla-help-desk.component';

describe('TablaHelpDeskComponent', () => {
  let component: TablaHelpDeskComponent;
  let fixture: ComponentFixture<TablaHelpDeskComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TablaHelpDeskComponent]
    });
    fixture = TestBed.createComponent(TablaHelpDeskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
