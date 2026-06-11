import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { AddTorrentMenuComponent } from './add-torrent-menu.component';

describe('AddTorrentMenuComponent', () => {
  let component: AddTorrentMenuComponent;
  let fixture: ComponentFixture<AddTorrentMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddTorrentMenuComponent ],
      providers: [
        { provide: DialogService, useValue: { open: jasmine.createSpy('open') } }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTorrentMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
