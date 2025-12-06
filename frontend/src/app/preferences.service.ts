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

  constructor() {
  }

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
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load preferences from localStorage', e);
    }
    return null;
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
