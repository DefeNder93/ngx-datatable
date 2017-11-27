import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'appVisible',
  pure: false
})
export class AppVisiblePipe implements PipeTransform {
  transform(items: any[], reverse: boolean): any {
    if (!items) {
      return items;
    }
    return reverse ? items.filter(item => item._inViewbox === false) : items.filter(item => item._inViewbox !== false);
  }
}
