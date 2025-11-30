import {Injectable} from '@angular/core';
import {State, Torrent} from './api.service';

/**
 * User preferences for filtering and sorting torrents
 */
export interface UserPreferences {
  sortByField: keyof Torrent | null;
  sortReverse: boolean;
  filterState: State | null;
}

const STORAGE_KEY = 'storm_preferences';

const DEFAULT_PREFERENCES: UserPreferences = {
  sortByField: null,
  sortReverse: false,
  filterState: null,
};

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {

  constructor() {
  }

  /**
   * Load user preferences from localStorage
   * @returns The saved preferences or default preferences if none exist
   */
  public load(): UserPreferences {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...DEFAULT_PREFERENCES,
          ...parsed,
        };
      }
    } catch (e) {
      console.error('Failed to load preferences from localStorage', e);
    }
    return {...DEFAULT_PREFERENCES};
  }

  /**
   * Save user preferences to localStorage
   * @param preferences The preferences to save
   */
  public save(preferences: Partial<UserPreferences>): void {
    try {
      const current = this.load();
      const updated = {
        ...current,
        ...preferences,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save preferences to localStorage', e);
    }
  }

  /**
   * Clear all saved preferences
   */
  public clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear preferences from localStorage', e);
    }
  }
}
