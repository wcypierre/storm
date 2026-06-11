import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { TorrentSearchComponent } from './torrent-search.component';

describe('TorrentSearchComponent', () => {
  let component: TorrentSearchComponent;
  let fixture: ComponentFixture<TorrentSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TorrentSearchComponent ],
      providers: [
        { provide: DialogService, useValue: { open: jasmine.createSpy('open') } }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TorrentSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
