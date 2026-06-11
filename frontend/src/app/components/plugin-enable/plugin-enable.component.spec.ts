import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ApiService } from '../../api.service';
import { PluginEnableComponent } from './plugin-enable.component';

describe('PluginEnableComponent', () => {
  let component: PluginEnableComponent;
  let fixture: ComponentFixture<PluginEnableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PluginEnableComponent ],
      providers: [
        { provide: DynamicDialogRef, useValue: { close: jasmine.createSpy('close') } },
        { provide: DynamicDialogConfig, useValue: { data: { name: 'TestPlugin' } } },
        { provide: ApiService, useValue: { enablePlugin: jasmine.createSpy('enablePlugin') } }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PluginEnableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
