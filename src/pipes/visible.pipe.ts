import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'appVisible',
  pure: false
})
export class AppVisiblePipe implements PipeTransform {
  transform(items: any[], filter: Object): any {
    if (!items) {
      return items;
    }
    return items.filter(item => item._inViewbox !== false);
  }
}
