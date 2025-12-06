import {Component, OnDestroy} from '@angular/core';
import {BehaviorSubject, combineLatest, EMPTY, forkJoin, Observable, of, Subject, timer} from 'rxjs';
import {catchError, filter, mergeMap, switchMap, takeUntil} from 'rxjs/operators';
import {ApiService, DiskSpace, Hash, SessionStatus, State, Torrent, ViewTorrent} from './api.service';
import {SelectItem} from 'primeng/api';
import {FocusService} from './focus.service';
import {DialogService} from 'primeng/dynamicdialog';
import {PluginEnableComponent} from './components/plugin-enable/plugin-enable.component';
import {PreferencesService} from './preferences.service';

type OptionalState = State | null;


@Component({
  selector: 't-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnDestroy {
  sortByField: keyof Torrent = null;
  sortReverse = false;
  filterState: OptionalState = null;

  private destroy$ = new Subject<void>();

  sortOptions: SelectItem<keyof Torrent>[] = [
    {
      label: 'State',
      value: 'State'
    },
    {
      label: 'Added',
      value: 'TimeAdded'
    },
    {
      label: 'Progress',
      value: 'Progress'
    },
    {
      label: 'ETA',
      value: 'ETA'
    },
    {
      label: 'Name',
      value: 'Name'
    },
    {
      label: 'Size',
      value: 'TotalSize'
    },
    {
      label: 'Ratio',
      value: 'Ratio'
    },
    {
      label: 'Seeding',
      value: 'SeedingTime'
    }
  ];

  filterStatesOptions: SelectItem<OptionalState>[] = [
    {
      label: 'All',
      value: null,
    },
    {
      label: 'Active',
      value: 'Active'
    },
    {
      label: 'Queued',
      value: 'Queued',
    },
    {
      label: 'Downloading',
      value: 'Downloading',
    },
    {
      label: 'Seeding',
      value: 'Seeding',
    },
    {
      label: 'Paused',
      value: 'Paused'
    },
    {
      label: 'Error',
      value: 'Error'
    }
  ];

  searchText: string;

  // All torrent hashes within the current view
  hashesInView: string[];
  // Current view is empty
  empty = false;
  stateInView: OptionalState;
  sessionStatus: SessionStatus = {
    HasIncomingConnections: false,
    UploadRate: 0,
    DownloadRate: 0,
    PayloadUploadRate: 0,
    PayloadDownloadRate: 0,
    TotalDownload: 0,
    TotalUpload: 0,
    NumPeers: 0,
    DhtNodes: 0,
  };
  diskSpace: DiskSpace;

  torrents: ViewTorrent[];

  connected = true;
  lastEtag: string;

  get$: BehaviorSubject<OptionalState>;

  constructor(
    private api: ApiService,
    private focus: FocusService,
    private dialogService: DialogService,
    private preferences: PreferencesService
  ) {
    // Load preferences from localStorage
    const savedPreferences = this.preferences.loadFilterPreferences();
    if (savedPreferences) {
      this.sortByField = savedPreferences.sortByField as keyof Torrent;
      this.sortReverse = savedPreferences.sortReverse;
      this.searchText = savedPreferences.searchText;
      this.filterState = savedPreferences.filterState as OptionalState;
      this.get$ = new BehaviorSubject<OptionalState>(this.filterState);
    } else {
      this.get$ = new BehaviorSubject<OptionalState>(null);
    }

    this.refreshInterval(2000);
    this.setupPreferencesSaving();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Save preferences whenever they change
   */
  private setupPreferencesSaving(): void {
    // Watch for changes to filter state
    this.get$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.savePreferences();
    });
  }

  /**
   * Save current preferences to localStorage
   */
  private savePreferences(): void {
    this.preferences.saveFilterPreferences({
      sortByField: this.sortByField,
      sortReverse: this.sortReverse,
      searchText: this.searchText || '',
      filterState: this.get$.value
    });
  }

  /**
   * Update sort field and save preferences
   */
  onSortFieldChange(field: keyof Torrent): void {
    this.sortByField = field;
    this.savePreferences();
  }

  /**
   * Toggle sort order and save preferences
   */
  onSortReverseToggle(): void {
    this.sortReverse = !this.sortReverse;
    this.savePreferences();
  }

  /**
   * Update search text and save preferences
   */
  onSearchTextChange(text: string): void {
    this.searchText = text;
    this.savePreferences();
  }


  /**
   * Opens the PluginEnable dialog component
   * @private
   */
  private enableLabelPlugin(): Observable<void> {
    const ref = this.dialogService.open(PluginEnableComponent, {
      header: 'Enable Plugin',
      showHeader: false,
      closable: false,
      closeOnEscape: false,
      dismissableMask: false,
      styleClass: 't-dialog-responsive',
      data: {
        name: 'Label'
      }
    });

    return ref.onClose;
  }

  /**
   * Updates the list of torrents at every given interval,
   * or when the selected $get state is updated.
   * @param interval
   * Update interval in milliseconds
   */
  private refreshInterval(interval: number): void {
    const timer$ = timer(0, interval);

    // Ensure the label plugin is enabled
    const labelPluginEnabled$ = this.api.plugins().pipe(
      switchMap(plugins => {
        const ok = plugins.findIndex(name => name === 'Label') > -1;
        if (ok) {
          return of(true);
        }

        return this.enableLabelPlugin();
      })
    );

    const interval$ = combineLatest([timer$, this.focus.observe, this.get$, labelPluginEnabled$]);

    interval$.pipe(
      // Continue only when in focus
      filter(([_, focus]) => focus),

      // Switch to API response of torrents
      mergeMap(([_, focus, state]) => this.api.viewUpdate(this.lastEtag, state).pipe(
        catchError(err => {
          console.error('Connection error', err);
          this.connected = false;
          this.lastEtag = null;
          return EMPTY;
        }),
      )),
    ).subscribe(
      response => {
        this.connected = true;
        this.sessionStatus = response.Session;
        this.diskSpace = {FreeBytes: response.DiskFree};
        this.torrents = response.Torrents;

        this.empty = this.torrents.length === 0;
        this.hashesInView = this.torrents.map(t => t.Hash);
        this.lastEtag = response.ETag;

        const statesInView = new Set(this.torrents.map(t => t.State));
        const [onlyStateInView] = statesInView.size === 1 ? statesInView : [];
        this.stateInView = onlyStateInView || null;
      }
    );
  }

  public trackBy(index: number, torrent: Hash): string {
    return torrent.Hash;
  }


  onToggleInView(targetState: 'pause' | 'resume', torrents: ViewTorrent[]): void {
    if (!torrents || torrents.length === 0) {
      return;
    }

    let res: Observable<void>;
    switch (targetState) {
      case 'pause':
        res = this.api.pause(...torrents.filter(t => t.State !== 'Paused').map(t => t.Hash));
        break;
      case 'resume':
        res = this.api.resume(...torrents.filter(t => t.State === 'Paused').map(t => t.Hash));
        break;
    }

    res.subscribe(
      _ => console.log(`torrents in view reached target state ${targetState}`)
    );
  }
}
