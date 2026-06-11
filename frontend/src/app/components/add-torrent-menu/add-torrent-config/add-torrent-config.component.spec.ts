import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AddTorrentConfigComponent } from './add-torrent-config.component';

describe('AddTorrentConfigComponent', () => {
  let component: AddTorrentConfigComponent;
  let fixture: ComponentFixture<AddTorrentConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddTorrentConfigComponent ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTorrentConfigComponent);
    component = fixture.componentInstance;
    component.config = {
      MaxDownloadSpeed: -1,
      MaxUploadSpeed: -1,
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
