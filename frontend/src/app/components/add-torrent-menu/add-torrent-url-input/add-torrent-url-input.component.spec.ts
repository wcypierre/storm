import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ApiService } from '../../../api.service';
import { AddTorrentUrlInputComponent } from './add-torrent-url-input.component';

describe('AddTorrentUrlInputComponent', () => {
  let component: AddTorrentUrlInputComponent;
  let fixture: ComponentFixture<AddTorrentUrlInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddTorrentUrlInputComponent ],
      providers: [
        { provide: DynamicDialogRef, useValue: { close: jasmine.createSpy('close') } },
        { provide: DynamicDialogConfig, useValue: { data: { url: '' } } },
        { provide: ApiService, useValue: { add: jasmine.createSpy('add') } }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTorrentUrlInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
