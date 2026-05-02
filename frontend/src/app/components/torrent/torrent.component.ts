import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ApiService, Torrent} from '../../api.service';
import {Observable} from 'rxjs';
import {switchMap, take} from 'rxjs/operators';

@Component({
  standalone: false,
  selector: 't-torrent',
  templateUrl: './torrent.component.html',
  styleUrls: ['./torrent.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TorrentComponent implements OnInit {
  @Input('hash') hash: string;
  @Input('torrent') torrent: Torrent;
  @Input('label') label: string;
  @Output('removed') removed = new EventEmitter<boolean>();

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
  }

  private refreshAfter(action: Observable<any>): void {
    action.pipe(
      switchMap(_ => this.api.torrent(this.hash)),
      take(1),
    ).subscribe(torrent => {
      this.torrent = torrent;
      this.cdr.markForCheck();
    });
  }

  public onPause(): void {
    this.refreshAfter(this.api.pause(this.hash));
  }

  public onResume(): void {
    this.refreshAfter(this.api.resume(this.hash));
  }

  public onChangeState(): void {
    if (this.torrent.State === 'Paused') {
      this.onResume();
      return;
    }

    this.onPause();
  }
}
