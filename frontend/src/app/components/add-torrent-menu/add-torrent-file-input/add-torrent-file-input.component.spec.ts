import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ApiService } from '../../../api.service';
import { AddTorrentFileInputComponent } from './add-torrent-file-input.component';

describe('AddTorrentFileInputComponent', () => {
  let component: AddTorrentFileInputComponent;
  let fixture: ComponentFixture<AddTorrentFileInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddTorrentFileInputComponent ],
      providers: [
        { provide: DynamicDialogRef, useValue: { close: jasmine.createSpy('close') } },
        { provide: DynamicDialogConfig, useValue: { data: {} } },
        { provide: ApiService, useValue: { add: jasmine.createSpy('add') } }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTorrentFileInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
