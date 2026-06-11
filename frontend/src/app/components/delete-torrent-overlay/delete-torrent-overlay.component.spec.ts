import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ApiService } from '../../api.service';
import { DeleteTorrentOverlayComponent } from './delete-torrent-overlay.component';

describe('DeleteTorrentOverlayComponent', () => {
  let component: DeleteTorrentOverlayComponent;
  let fixture: ComponentFixture<DeleteTorrentOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeleteTorrentOverlayComponent ],
      providers: [
        { provide: ApiService, useValue: { removeTorrent: jasmine.createSpy('removeTorrent') } }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteTorrentOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
