import {Component, Input} from '@angular/core';
import {State} from '../../api.service';

@Component({
  standalone: false,
  selector: 't-torrent-state',
  templateUrl: './torrent-state.component.html',
  styleUrls: ['./torrent-state.component.scss']
})
export class TorrentStateComponent {
  @Input('state') state: State;

  constructor() {
  }

}
