import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NgxFilesizeModule } from 'ngx-filesize';
import { SessionStatusComponent } from './session-status.component';

describe('SessionStatusComponent', () => {
  let component: SessionStatusComponent;
  let fixture: ComponentFixture<SessionStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SessionStatusComponent ],
      imports: [ NgxFilesizeModule ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SessionStatusComponent);
    component = fixture.componentInstance;
    component.sessionStatus = {
      HasIncomingConnections: false,
      UploadRate: 0,
      DownloadRate: 0,
      PayloadUploadRate: 0,
      PayloadDownloadRate: 0,
      TotalDownload: 0,
      TotalUpload: 0,
      NumPeers: 0,
      DhtNodes: 0,
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
