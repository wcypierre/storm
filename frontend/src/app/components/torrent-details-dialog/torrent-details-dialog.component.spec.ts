import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { TorrentDetailsDialogComponent } from './torrent-details-dialog.component';

describe('TorrentDetailsDialogComponent', () => {
  let component: TorrentDetailsDialogComponent;
  let fixture: ComponentFixture<TorrentDetailsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TorrentDetailsDialogComponent ],
      providers: [
        { provide: DynamicDialogRef, useValue: { close: jasmine.createSpy('close') } },
        { provide: DynamicDialogConfig, useValue: { data: { id: 'test-id', torrent: null } } }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TorrentDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
