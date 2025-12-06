import { TestBed, fakeAsync, tick, discardPeriodicTasks, flush } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DialogService } from 'primeng/dynamicdialog';
import { PreferencesService } from './preferences.service';
import { ENVIRONMENT } from './environment';
import { ApiService } from './api.service';
import { FocusService } from './focus.service';
import { of } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { TorrentSearchPipe } from './torrent-search.pipe';
import { OrderByPipe } from './order-by.pipe';

describe('AppComponent', () => {
  let preferencesService: PreferencesService;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockFocusService: jasmine.SpyObj<FocusService>;

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['plugins', 'viewUpdate']);
    const focusServiceSpy = jasmine.createSpyObj('FocusService', [], { observe: of(true) });

    // Setup default return values
    apiServiceSpy.plugins.and.returnValue(of(['Label']));
    apiServiceSpy.viewUpdate.and.returnValue(of({
      Session: {
        HasIncomingConnections: false,
        UploadRate: 0,
        DownloadRate: 0,
        PayloadUploadRate: 0,
        PayloadDownloadRate: 0,
        TotalDownload: 0,
        TotalUpload: 0,
        NumPeers: 0,
        DhtNodes: 0,
      },
      DiskFree: 0,
      Torrents: [],
      ETag: 'test-etag'
    }));

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      declarations: [
        AppComponent,
        TorrentSearchPipe,
        OrderByPipe
      ],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: FocusService, useValue: focusServiceSpy },
        DialogService,
        PreferencesService,
        { provide: ENVIRONMENT, useValue: { baseApiPath: '/api' } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    preferencesService = TestBed.inject(PreferencesService);
    mockApiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    mockFocusService = TestBed.inject(FocusService) as jasmine.SpyObj<FocusService>;
    
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should load preferences from localStorage on initialization', () => {
    const preferences = {
      sortByField: 'Name',
      sortReverse: true,
      searchText: 'test',
      filterState: 'Downloading'
    };
    preferencesService.saveFilterPreferences(preferences);

    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    expect(app.sortByField).toEqual('Name');
    expect(app.sortReverse).toEqual(true);
    expect(app.searchText).toEqual('test');
    expect(app.get$.value).toEqual('Downloading');
  });

  it('should initialize with default values when no preferences are stored', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    expect(app.sortByField).toBeNull();
    expect(app.sortReverse).toBe(false);
    expect(app.get$.value).toBeNull();
  });

  it('should save preferences when sort field changes', fakeAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    app.onSortFieldChange('Name');
    tick(600); // Wait for debounce (500ms + buffer)

    const saved = preferencesService.loadFilterPreferences();
    expect(saved.sortByField).toEqual('Name');
    
    discardPeriodicTasks(); // Clean up the timer from refreshInterval
  }));

  it('should save preferences when sort order toggles', fakeAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    app.onSortReverseToggle();
    tick(600); // Wait for debounce

    const saved = preferencesService.loadFilterPreferences();
    expect(saved.sortReverse).toBe(true);
    
    discardPeriodicTasks();
  }));

  it('should save preferences when search text changes', fakeAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    app.onSearchTextChange('test search');
    tick(600); // Wait for debounce

    const saved = preferencesService.loadFilterPreferences();
    expect(saved.searchText).toEqual('test search');
    
    discardPeriodicTasks();
  }));
});
