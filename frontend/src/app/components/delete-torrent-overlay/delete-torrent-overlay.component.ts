import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {ApiException, ApiService} from '../../api.service';
import {Popover} from 'primeng/popover';
import {catchError, finalize, mergeMap, retry} from 'rxjs/operators';
import {from, throwError} from 'rxjs';
import {ToastMessageOptions as Message} from 'primeng/api';

@Component({
  standalone: false,
  selector: 't-delete-torrent-overlay',
  templateUrl: './delete-torrent-overlay.component.html',
  styleUrls: ['./delete-torrent-overlay.component.scss']
})
export class DeleteTorrentOverlayComponent {
  @Input('torrents') torrents: string[];
  @Output('removed') removed = new EventEmitter<boolean>();

  @ViewChild('overlay') overlay: Popover;

  processing = false;
  errorMessages: Message[] = [];

  constructor(private api: ApiService) {
  }

  public toggle($event: MouseEvent): void {
    this.overlay.toggle($event, $event.target as HTMLElement);
  }

  onRemove(withData: boolean): void {
    this.processing = true;
    this.errorMessages = [];

    from(this.torrents).pipe(
      mergeMap(hash => this.api.removeTorrent(withData, hash).pipe(
        retry(2),
        catchError((err: ApiException) => {
          this.errorMessages.push({
            severity: 'error',
            summary: 'Failed to remove torrent',
            detail: err.error
          });
          return throwError(err);
        })
      )),
      finalize(() => {
        this.processing = false;
        if (this.errorMessages.length === 0) {
          this.overlay.hide();
        }
        this.removed.emit(true);
      })
    ).subscribe(
      _ => console.log('torrent deleted'),
      err => console.error('Error removing torrents:', err)
    );
  }
}
