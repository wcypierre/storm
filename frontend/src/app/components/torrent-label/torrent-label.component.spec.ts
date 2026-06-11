import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TorrentEditLabelService } from '../torrent-edit-label-dialog/torrent-edit-label-dialog.component';
import { TorrentLabelComponent } from './torrent-label.component';

describe('TorrentLabelComponent', () => {
  let component: TorrentLabelComponent;
  let fixture: ComponentFixture<TorrentLabelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TorrentLabelComponent ],
      providers: [
        { provide: TorrentEditLabelService, useValue: { open: jasmine.createSpy('open') } }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TorrentLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
