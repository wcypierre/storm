import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ApiService } from '../../../api.service';
import { AddTorrentMagnetInputComponent } from './add-torrent-magnet-input.component';

describe('AddTorrentMagnetInputComponent', () => {
  let component: AddTorrentMagnetInputComponent;
  let fixture: ComponentFixture<AddTorrentMagnetInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddTorrentMagnetInputComponent ],
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
    fixture = TestBed.createComponent(AddTorrentMagnetInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
