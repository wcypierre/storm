import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { ApiKeyDialogComponent } from './api-key-dialog.component';

describe('ApiKeyDialogComponent', () => {
  let component: ApiKeyDialogComponent;
  let fixture: ComponentFixture<ApiKeyDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApiKeyDialogComponent ],
      imports: [ FormsModule ],
      providers: [
        { provide: DynamicDialogRef, useValue: { close: jasmine.createSpy('close') } }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApiKeyDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
