import {Injectable} from '@angular/core';
import {State, Torrent} from './api.service';

/**
 * Valid sort field values for torrents
 */
export type SortField = 'State' | 'TimeAdded' | 'Progress' | 'ETA' | 'Name' | 'TotalSize' | 'Ratio' | 'SeedingTime';

/**
 * User preferences for filtering and sorting torrents
 */
export interface UserPreferences {
  sortByField: SortField | null;
  sortReverse: boolean;
  filterState: State | null;
}

const STORAGE_KEY = 'storm_preferences';

const VALID_SORT_FIELDS: SortField[] = ['State', 'TimeAdded', 'Progress', 'ETA', 'Name', 'TotalSize', 'Ratio', 'SeedingTime'];
const VALID_FILTER_STATES: (State | null)[] = [null, 'Active', 'Queued', 'Downloading', 'Seeding', 'Paused', 'Error'];

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
        // Validate and sanitize stored values
        const sortByField = VALID_SORT_FIELDS.includes(parsed.sortByField) ? parsed.sortByField : null;
        const sortReverse = typeof parsed.sortReverse === 'boolean' ? parsed.sortReverse : false;
        const filterState = VALID_FILTER_STATES.includes(parsed.filterState) ? parsed.filterState : null;
        return {
          sortByField,
          sortReverse,
          filterState,
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
