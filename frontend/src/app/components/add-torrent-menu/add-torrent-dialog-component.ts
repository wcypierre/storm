import {AddTorrent, AddTorrentRequest, ApiException, ApiService, TorrentOptions} from '../../api.service';
import {DynamicDialogConfig, DynamicDialogRef} from 'primeng/dynamicdialog';
import {Injector} from '@angular/core';
import {catchError, finalize} from 'rxjs/operators';
import {throwError} from 'rxjs';
import {Message} from 'primeng/api';

export class AddTorrentDialogComponentDirective<T> {
  public static DefaultIcon = 'far fa-plus-square';

  public config: TorrentOptions;
  public submitIcon = AddTorrentDialogComponentDirective.DefaultIcon;
  public submitIsDisabled = false;
  public errorMessages: Message[] = [];

  api: ApiService;
  ref: DynamicDialogRef;
  data: Partial<T>;

  constructor(injector: Injector) {
    this.api = injector.get(ApiService) as ApiService;
    this.ref = injector.get(DynamicDialogRef) as DynamicDialogRef;
    this.data = (injector.get(DynamicDialogConfig) as DynamicDialogConfig).data || {};
    this.config = {
      MaxDownloadSpeed: -1,
      MaxUploadSpeed: -1,
    };
  }

  public close(): void {
    this.ref.close(false);
  }

  public submit(opt: AddTorrent): void {
    const req: AddTorrentRequest = Object.assign({Options: this.config}, opt);

    this.submitIcon = 'fa-spin fas fa-spinner';
    this.submitIsDisabled = true;
    this.errorMessages.splice(0);

    this.api.add(req).pipe(
      // Retry failed requests up to 2 times with exponential backoff
      catchError((err: ApiException, caught) => {
        // Check if we should retry based on status code (retry on 5xx, 429, network errors)
        if (err.status >= 500 || err.status === 429 || err.status === 0) {
          // Return the observable to retry
          return caught;
        }
        // For other errors, don't retry
        return throwError(err);
      }),
      catchError((err: ApiException) => {
        // Catch Api exceptions and push them to the messages stack
        this.errorMessages = [err.message];
        return throwError(err);

      }),
      finalize(() => {
        this.submitIcon = AddTorrentDialogComponentDirective.DefaultIcon;
        this.submitIsDisabled = false;
      })
    ).subscribe(
      response => this.ref.close(response.ID),
      err => console.error('Error adding torrent:', err)
    );
  }
}
