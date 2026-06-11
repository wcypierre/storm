import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NgxFilesizeModule } from 'ngx-filesize';
import { MomentModule } from 'ngx-moment';
import { ApiService } from '../../api.service';
import { TorrentComponent } from './torrent.component';

describe('TorrentComponent', () => {
  let component: TorrentComponent;
  let fixture: ComponentFixture<TorrentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TorrentComponent ],
      imports: [ NgxFilesizeModule, MomentModule ],
      providers: [
        { provide: ApiService, useValue: { pause: jasmine.createSpy('pause'), resume: jasmine.createSpy('resume'), torrent: jasmine.createSpy('torrent') } }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TorrentComponent);
    component = fixture.componentInstance;
    component.torrent = {
      ActiveTime: 0, CompletedTime: 0, TimeAdded: 0, DistributedCopies: 0,
      ETA: 0, Progress: 0, Ratio: 0, IsFinished: false, IsSeed: false,
      Private: false, DownloadLocation: '', DownloadPayloadRate: 0,
      Name: 'Test Torrent', NextAnnounce: 0, NumPeers: 0, NumPieces: 0,
      NumSeeds: 0, PieceLength: 0, SeedingTime: 0, State: 'Downloading',
      TotalDone: 0, TotalPeers: 0, TotalSeeds: 0, TotalSize: 0,
      TrackerHost: '', TrackerStatus: '', UploadPayloadRate: 0,
      FilePriorities: [], FileProgress: []
    };
    component.hash = 'test-hash';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
