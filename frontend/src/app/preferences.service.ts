import {Injectable} from '@angular/core';

export interface FilterPreferences {
  sortByField: string | null;
  sortReverse: boolean;
  searchText: string;
  filterState: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {
  private readonly STORAGE_KEY = 'storm_filter_preferences';

  /**
   * Save filter preferences to localStorage
   */
  saveFilterPreferences(preferences: FilterPreferences): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(preferences));
    } catch (e) {
      console.warn('Failed to save preferences to localStorage', e);
    }
  }

  /**
   * Load filter preferences from localStorage
   */
  loadFilterPreferences(): FilterPreferences | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validate that the parsed object has the expected structure
        if (this.isValidFilterPreferences(parsed)) {
          return parsed;
        }
        console.warn('Invalid preferences structure in localStorage, ignoring');
      }
    } catch (e) {
      console.warn('Failed to load preferences from localStorage', e);
    }
    return null;
  }

  /**
   * Validate that an object matches the FilterPreferences interface
   */
  private isValidFilterPreferences(obj: any): obj is FilterPreferences {
    return (
      obj !== null &&
      typeof obj === 'object' &&
      (obj.sortByField === null || typeof obj.sortByField === 'string') &&
      typeof obj.sortReverse === 'boolean' &&
      typeof obj.searchText === 'string' &&
      (obj.filterState === null || typeof obj.filterState === 'string')
    );
  }

  /**
   * Clear filter preferences from localStorage
   */
  clearFilterPreferences(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear preferences from localStorage', e);
    }
  }
}
