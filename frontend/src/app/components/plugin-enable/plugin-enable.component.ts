import { Component, OnInit } from '@angular/core';
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {ApiException, ApiService} from "../../api.service";
import {catchError, finalize, retry} from 'rxjs/operators';
import {throwError} from 'rxjs';
import {ToastMessageOptions as Message} from 'primeng/api';

@Component({
  selector: 't-plugin-enable',
  templateUrl: './plugin-enable.component.html',
  styleUrls: ['./plugin-enable.component.scss']
})
export class PluginEnableComponent implements OnInit {
  name: string;

  inProgress: boolean = false;
  errorMessages: Message[] = [];
  retryCount: number = 0;
  maxRetries: number = 2;

  constructor(private ref: DynamicDialogRef, private config: DynamicDialogConfig, private api: ApiService) {
    this.name = config.data.name;
  }

  ngOnInit(): void {
  }

  onSubmit(): void {
    this.inProgress = true;
    this.errorMessages = [];

    this.api.enablePlugin(this.name).pipe(
      retry(this.maxRetries),
      finalize(() => {
        this.inProgress = false;
      }),
      catchError((err: ApiException) => {
        this.errorMessages = [{
          severity: 'error',
          summary: 'Failed to enable plugin',
          detail: err.error
        }];
        return throwError(err);
      })
    ).subscribe(
      _ => {
        this.ref.close(true);
      },
      err => console.error('Error enabling plugin:', err)
    );
  }

}
