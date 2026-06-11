import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ApiService } from '../../api.service';
import { of } from 'rxjs';
import { TorrentEditLabelDialogComponent } from './torrent-edit-label-dialog.component';

describe('TorrentEditLabelDialogComponent', () => {
  let component: TorrentEditLabelDialogComponent;
  let fixture: ComponentFixture<TorrentEditLabelDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TorrentEditLabelDialogComponent ],
      providers: [
        { provide: DynamicDialogRef, useValue: { close: jasmine.createSpy('close') } },
        { provide: DynamicDialogConfig, useValue: { data: { id: 'test-id', currentLabel: '' } } },
        { provide: ApiService, useValue: { labels: () => of([]), deleteLabel: jasmine.createSpy('deleteLabel'), createLabel: jasmine.createSpy('createLabel'), setTorrentLabel: jasmine.createSpy('setTorrentLabel') } }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TorrentEditLabelDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
