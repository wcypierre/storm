import {Pipe, PipeTransform} from '@angular/core';
import {filesize} from 'filesize';

@Pipe({
  standalone: false,
  name: 'filesize'
})
export class FilesizePipe implements PipeTransform {
  transform(value: number): string {
    return filesize(value);
  }
}
