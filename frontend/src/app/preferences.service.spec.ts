import {TestBed} from '@angular/core/testing';
import {PreferencesService} from './preferences.service';

describe('PreferencesService', () => {
  let service: PreferencesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PreferencesService);
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should save and load filter preferences', () => {
    const preferences = {
      sortByField: 'Name',
      sortReverse: true,
      searchText: 'test',
      filterState: 'Downloading'
    };

    service.saveFilterPreferences(preferences);
    const loaded = service.loadFilterPreferences();

    expect(loaded).toEqual(preferences);
  });

  it('should return null when no preferences are stored', () => {
    const loaded = service.loadFilterPreferences();
    expect(loaded).toBeNull();
  });

  it('should clear preferences', () => {
    const preferences = {
      sortByField: 'Name',
      sortReverse: false,
      searchText: '',
      filterState: null
    };

    service.saveFilterPreferences(preferences);
    expect(service.loadFilterPreferences()).toEqual(preferences);

    service.clearFilterPreferences();
    expect(service.loadFilterPreferences()).toBeNull();
  });

  it('should handle invalid JSON in localStorage', () => {
    localStorage.setItem('storm_filter_preferences', 'invalid json');
    const loaded = service.loadFilterPreferences();
    expect(loaded).toBeNull();
  });
});
