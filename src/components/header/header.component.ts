import {
  Component, Output, EventEmitter, Input, HostBinding, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, OnDestroy
} from '@angular/core';
import { SortType, SelectionType } from '../../types';
import { columnsByPin, columnGroupWidths, columnsByPinArr, translateXY } from '../../utils';
import { DataTableColumnDirective } from '../columns';
import { MouseEvent } from '../../events';
import {Subject} from 'rxjs/Subject';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {ReplaySubject} from 'rxjs/ReplaySubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/map';

@Component({
  selector: 'datatable-header',
  template: `
    <!--stickyHeader ? _innerWidth - 1 : _columnGroupWidths.total-->
    <div
      orderable
      (reorder)="onColumnReordered($event)"
      [style.width.px]="_innerWidth"
      [ngClass]="{'datatable-sticky-header': stickyHeader}"
      class="datatable-header-inner">
      <div
        class="datatable-row-center"
        [ngStyle]="_styleByGroup['center']">
        <datatable-header-cell
          *ngFor="let column of headerColumns$ | async; trackBy: columnTrackingFn"
          resizeable
          [resizeEnabled]="column.resizeable"
          (resize)="onColumnResized($event, column)"
          long-press
          [pressModel]="column"
          [pressEnabled]="reorderable && column.draggable"
          (longPressStart)="onLongPressStart($event)"
          (longPressEnd)="onLongPressEnd($event)"
          draggable
          [dragX]="reorderable && column.draggable && column.dragging"
          [dragY]="false"
          [dragModel]="column"
          [dragEventTarget]="dragEventTarget"
          [headerHeight]="headerHeight"
          [column]="column"
          [sortType]="sortType"
          [sorts]="sorts"
          [selectionType]="selectionType"
          [sortAscendingIcon]="sortAscendingIcon"
          [sortDescendingIcon]="sortDescendingIcon"
          [allRowsSelected]="allRowsSelected"
          (sort)="onSort($event)"
          (select)="select.emit($event)"
          (columnContextmenu)="columnContextmenu.emit($event)">
        </datatable-header-cell>
      </div>
    </div>
  `,
  host: {
    class: 'datatable-header'
  },
  styles: [`
    /*.datatable-header-inner.datatable-sticky-header {*/
      /*position: fixed;*/
      /*top: 0;*/
      /*background-color: #FFF;*/
      /*z-index: 30;*/
      /*opacity: 1;*/
      /*border-bottom: 1px solid rgba(0, 0, 0, 0.12);*/
    /*}*/
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataTableHeaderComponent implements OnInit, OnDestroy{

  ngOnInit(): void {
    this.columnsResize.takeUntil(this.destroy$)
      .subscribe(e => this._columnsResize.next(e));
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
  }

  constructor(private cd: ChangeDetectorRef) {}

  @Input() sortAscendingIcon: any;
  @Input() sortDescendingIcon: any;
  @Input() scrollbarH: boolean;
  @Input() dealsWithGroup: boolean;
  @Input() stickyHeader: boolean;

  @Input()
  columnsResize: Subject<any>;
  _columnsResize = new Subject<any>();

  private destroy$ = new ReplaySubject(1);

  columns$ = new BehaviorSubject([]);
  headerColumns$ = Observable.combineLatest(
    this.columns$.asObservable(),
    this._columnsResize.startWith(null)
  ).map(([columns, columnsResize]) => columnsResize ? columns.filter((e, i) => columnsResize[i]) : columns);

  _innerWidth: number;

  @Input() set innerWidth(val: number) {
    this._innerWidth = val;

    if (this._columns) {    
      const colByPin = columnsByPin(this._columns);
      this._columnGroupWidths = columnGroupWidths(colByPin, this._columns);
      this.setStylesByGroup();
    }
  }
    
  get innerWidth(): number {
    return this._innerWidth;
  }

  @Input() sorts: any[];
  @Input() sortType: SortType;
  @Input() allRowsSelected: boolean;
  @Input() selectionType: SelectionType;
  @Input() reorderable: boolean;

  dragEventTarget: any;

  @HostBinding('style.height')
  @Input() set headerHeight(val: any) {
    if (val !== 'auto') {
      this._headerHeight = `${val}px`;
    } else {
      this._headerHeight = val;
    }
  }

  get headerHeight(): any {
    return this._headerHeight;
  }

  @Input() set columns(val: any[]) {
    this._columns = val;
    const colsByPin = columnsByPin(val);
    this._columnsByPin = columnsByPinArr(val);
    this.columns$.next(this._columnsByPin[1].columns);
    this._columnGroupWidths = columnGroupWidths(colsByPin, val);
    this.setStylesByGroup();
  }

  get columns(): any[] {
    return this._columns;
  }

  @Input()
  set offsetX(val: number) {
    this._offsetX = val;
    this.setStylesByGroup();
  }
  get offsetX() { return this._offsetX; }

  @Output() sort: EventEmitter<any> = new EventEmitter();
  @Output() reorder: EventEmitter<any> = new EventEmitter();
  @Output() resize: EventEmitter<any> = new EventEmitter();
  @Output() select: EventEmitter<any> = new EventEmitter();
  @Output() columnContextmenu = new EventEmitter<{ event: MouseEvent, column: any }>(false);

  _columnsByPin: any;
  _columnGroupWidths: any;
  _offsetX: number;
  _columns: any[];
  _headerHeight: string;
  _styleByGroup = {
    left: {},
    center: {},
    right: {}
  };

  onLongPressStart({ event, model }: { event: any, model: any }) {
    model.dragging = true;
    this.dragEventTarget = event;
  }

  onLongPressEnd({ event, model }: { event: any, model: any }) {
    this.dragEventTarget = event;

    // delay resetting so sort can be
    // prevented if we were dragging
    setTimeout(() => {
      model.dragging = false;
    }, 5);
  }

  @HostBinding('style.width')
  get headerWidth(): string {
    if (this.scrollbarH) {
      return this.innerWidth + 'px';
    }

    return '100%';
  }

  trackByGroups(index: number, colGroup: any): any {    
    return colGroup.type;
  }

  columnTrackingFn(index: number, column: any): any {
    return column.$$id;
  }

  onColumnResized(width: number, column: DataTableColumnDirective): void {
    if (width <= column.minWidth) {
      width = column.minWidth;
    } else if (width >= column.maxWidth) {
      width = column.maxWidth;
    }

    this.resize.emit({
      column,
      prevValue: column.width,
      newValue: width
    });
  }

  onColumnReordered({ prevIndex, newIndex, model }: any): void {
    this.reorder.emit({
      column: model,
      prevValue: prevIndex,
      newValue: newIndex
    });
  }

  onSort({ column, prevValue, newValue }: any): void {
    // if we are dragging don't sort!
    if (column.dragging) return;

    const sorts = this.calcNewSorts(column, prevValue, newValue);
    this.sort.emit({
      sorts,
      column,
      prevValue,
      newValue
    });
  }

  calcNewSorts(column: any, prevValue: number, newValue: number): any[] {
    let idx = 0;

    if (!this.sorts) {
      this.sorts = [];
    }

    const sorts = this.sorts.map((s, i) => {
      s = { ...s };
      if (s.prop === column.prop) idx = i;
      return s;
    });

    if (newValue === undefined) {
      sorts.splice(idx, 1);
    } else if (prevValue) {
      sorts[idx].dir = newValue;
    } else {
      if (this.sortType === SortType.single) {
        sorts.splice(0, this.sorts.length);
      }

      sorts.push({ dir: newValue, prop: column.prop });
    }

    return sorts;
  }

  setStylesByGroup() {
    this._styleByGroup['left'] = this.calcStylesByGroup('left');
    this._styleByGroup['center'] = this.calcStylesByGroup('center');
    this._styleByGroup['right'] = this.calcStylesByGroup('right');
    this.cd.detectChanges();
  }

  calcStylesByGroup(group: string): any {
    // console.log('calcStylesByGroup ' + this.innerWidth);
    // // return this.innerWidth;
    // return {
    //   width: `${this.innerWidth[group]}px`
    // };

    const widths = this._columnGroupWidths;
    const offsetX = this.offsetX;

    const styles = {
      width: `${widths[group]}px`
    };

    if (group === 'center') {
      translateXY(styles, offsetX * -1, 0);
    } else if (group === 'right') {
      const totalDiff = widths.total - this.innerWidth;
      const offset = totalDiff * -1;
      translateXY(styles, offset, 0);
    }

    return styles;
  }
}
