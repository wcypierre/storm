import {TestBed} from '@angular/core/testing';

import {PreferencesService, UserPreferences} from './preferences.service';

describe('PreferencesService', () => {
  let service: PreferencesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PreferencesService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('load', () => {
    it('should return default preferences when no preferences are saved', () => {
      const prefs = service.load();
      expect(prefs.sortByField).toBeNull();
      expect(prefs.sortReverse).toBe(false);
      expect(prefs.filterState).toBeNull();
    });

    it('should return saved preferences', () => {
      const saved: UserPreferences = {
        sortByField: 'Name',
        sortReverse: true,
        filterState: 'Downloading',
      };
      localStorage.setItem('storm_preferences', JSON.stringify(saved));

      const prefs = service.load();
      expect(prefs.sortByField).toBe('Name');
      expect(prefs.sortReverse).toBe(true);
      expect(prefs.filterState).toBe('Downloading');
    });

    it('should return default preferences when localStorage contains invalid JSON', () => {
      localStorage.setItem('storm_preferences', 'invalid json');

      const prefs = service.load();
      expect(prefs.sortByField).toBeNull();
      expect(prefs.sortReverse).toBe(false);
      expect(prefs.filterState).toBeNull();
    });

    it('should merge saved preferences with defaults for missing fields', () => {
      localStorage.setItem('storm_preferences', JSON.stringify({sortByField: 'State'}));

      const prefs = service.load();
      expect(prefs.sortByField).toBe('State');
      expect(prefs.sortReverse).toBe(false);
      expect(prefs.filterState).toBeNull();
    });

    it('should return default values for invalid sort fields', () => {
      localStorage.setItem('storm_preferences', JSON.stringify({sortByField: 'InvalidField'}));

      const prefs = service.load();
      expect(prefs.sortByField).toBeNull();
    });

    it('should return default values for invalid filter states', () => {
      localStorage.setItem('storm_preferences', JSON.stringify({filterState: 'InvalidState'}));

      const prefs = service.load();
      expect(prefs.filterState).toBeNull();
    });

    it('should return default values for invalid sortReverse type', () => {
      localStorage.setItem('storm_preferences', JSON.stringify({sortReverse: 'yes'}));

      const prefs = service.load();
      expect(prefs.sortReverse).toBe(false);
    });
  });

  describe('save', () => {
    it('should save preferences to localStorage', () => {
      service.save({sortByField: 'Progress', sortReverse: true});

      const stored = localStorage.getItem('storm_preferences');
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored);
      expect(parsed.sortByField).toBe('Progress');
      expect(parsed.sortReverse).toBe(true);
    });

    it('should merge new preferences with existing preferences', () => {
      service.save({sortByField: 'Name'});
      service.save({filterState: 'Seeding'});

      const stored = localStorage.getItem('storm_preferences');
      const parsed = JSON.parse(stored);
      expect(parsed.sortByField).toBe('Name');
      expect(parsed.filterState).toBe('Seeding');
    });
  });

  describe('clear', () => {
    it('should remove preferences from localStorage', () => {
      service.save({sortByField: 'Name'});
      expect(localStorage.getItem('storm_preferences')).toBeTruthy();

      service.clear();
      expect(localStorage.getItem('storm_preferences')).toBeNull();
    });
  });
});
