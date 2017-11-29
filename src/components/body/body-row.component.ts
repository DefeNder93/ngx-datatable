import {
  Component, Input, HostBinding, ElementRef, Output, KeyValueDiffers, KeyValueDiffer,
  EventEmitter, HostListener, ChangeDetectionStrategy, ChangeDetectorRef, DoCheck, OnInit
} from '@angular/core';

import {
  allColumnsByPinArr, columnsByPin, columnGroupWidths, columnsByPinArr, translateXY, Keys
} from '../../utils';
import { ScrollbarHelper } from '../../services';
import { MouseEvent, KeyboardEvent } from '../../events';
import {Subject} from 'rxjs/Subject';
import {RowSharedData} from '../../services/row-shared-data.service';

@Component({
  selector: 'datatable-body-row',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      *ngFor="let colGroup of _columnsByPin; let i = index; trackBy: trackByGroups"
      class="datatable-row-{{colGroup.type}} datatable-row-group"
      style="flex-direction: column"
      [ngStyle]="_groupStyles[colGroup.type]">

      <div class="datatable-main-row">
        <datatable-body-cell
          *ngFor="let column of colGroup.columns | appVisible; let ii = index; trackBy: columnTrackingFn"
          tabindex="-1"
          [row]="row"
          [group]="group"
          [responsive]="responsive"
          [expanded]="expanded"
          [columnExpanded]="columnExpanded"
          [isSelected]="isSelected"
          [columnIndex]="ii"
          [rowIndex]="rowIndex"
          [column]="column"
          [rowHeight]="rowHeight"
          [displayCheck]="displayCheck"
          (toggleColumnExpand)="toggleColumnExpand($event)"
          (activate)="onActivate($event, ii)">
        </datatable-body-cell>
      </div>

      <div *ngIf="columnExpanded" class="datatable-responsive-row">
        <datatable-body-cell
          *ngFor="let column of colGroup.columns | appVisible:true; let ii = index; trackBy: columnTrackingFn"
          tabindex="-1"
          [row]="row"
          [group]="group"
          [expanded]="expanded"
          [isSelected]="isSelected"
          [rowIndex]="rowIndex"
          [column]="column"
          [rowHeight]="rowHeight"
          [displayCheck]="displayCheck"
          (activate)="onActivate($event, ii)">
        </datatable-body-cell>
      </div>
    </div>      
  `,
  styles: [`
    .datatable-responsive-row {
      display: flex; 
      flex-direction: column;
    }
    .datatable-main-row {
      display: flex;
    }
    .datatable-responsive-row /deep/ .datatable-body-column-name {
      display: inline;
    }
    .datatable-responsive-row /deep/ .datatable-body-cell-label {
      display: inline;
    }
  `]

})
export class DataTableBodyRowComponent implements DoCheck, OnInit {

  responsive: boolean = false;

  ngOnInit() {
    this._columnsByPin[1].columns.forEach(c => c._inViewbox = true);
    this.columnsResize.subscribe(resizeMap => {
      this.rowSharedData.columnResizeMap = resizeMap;
      console.log('columns resize body', resizeMap);
      resizeMap.forEach((collapsed, i) => this._columnsByPin[1].columns[i]._inViewbox = collapsed);
      this.responsive = resizeMap.indexOf(false) !== -1;
      this.cd.markForCheck();
    });
  }

  @Input()
  columnsResize: Subject<any>;

  @Input() set columns(val: any[]) {
    this._columns = val;
    this.recalculateColumns(val);
  }

  get columns(): any[] {
    return this._columns;
  }

  @Input() set innerWidth(val: number) {
    if (this._columns) {
      const colByPin = columnsByPin(this._columns);
      this._columnGroupWidths = columnGroupWidths(colByPin, colByPin);  
    }

    this._innerWidth = val;
    this.recalculateColumns();
    this.buildStylesByGroup();    
  }

  get innerWidth(): number {
    return this._innerWidth;
  }

  @Input() expanded: boolean;
  @Input() rowClass: any;
  @Input() row: any;
  @Input() group: any;
  @Input() isSelected: boolean;
  @Input() rowIndex: number;
  @Input() displayCheck: any;

  @Input()
  set offsetX(val: number) {
    this._offsetX = val;
    this.buildStylesByGroup();
  }
  get offsetX() { return this._offsetX; }

  columnExpanded = false;
  toggleColumnExpand = (e) => this.columnExpanded = !this.columnExpanded;

  @HostBinding('class')
  get cssClass() {
    let cls = 'datatable-body-row';
    if (this.isSelected) cls += ' active';
    if (this.rowIndex % 2 !== 0) cls += ' datatable-row-odd';
    if (this.rowIndex % 2 === 0) cls += ' datatable-row-even';

    if (this.rowClass) {
      const res = this.rowClass(this.row);
      if (typeof res === 'string') {
        cls += ` ${res}`;
      } else if (typeof res === 'object') {
        const keys = Object.keys(res);
        for (const k of keys) {
          if (res[k] === true) cls += ` ${k}`;
        }
      }
    }

    return cls;
  }

  @HostBinding('style.height.px')
  @Input() rowHeight: number;

  @HostBinding('style.width.px')
  get columnsTotalWidths(): string {
    return this._columnGroupWidths.total;
  }

  @Output() activate: EventEmitter<any> = new EventEmitter();

  _element: any;
  _columnGroupWidths: any;
  _columnsByPin: any;
  _offsetX: number;
  _columns: any[];
  _innerWidth: number;
  _groupStyles = {
    left: {},
    center: {},
    right: {}
  };

  private _rowDiffer: KeyValueDiffer<{}, {}>;

  constructor(
      private differs: KeyValueDiffers,
      private scrollbarHelper: ScrollbarHelper,
      private cd: ChangeDetectorRef,
      private rowSharedData: RowSharedData,
      element: ElementRef) {
    this._element = element.nativeElement;
    this._rowDiffer = differs.find({}).create();
  }

  ngDoCheck(): void {
    if (this._rowDiffer.diff(this.row)) {
      this.cd.markForCheck();
    }
  }
  
  trackByGroups(index: number, colGroup: any): any {
    return colGroup.type;
  }

  columnTrackingFn(index: number, column: any): any {
    return column.$$id;
  }

  buildStylesByGroup() {
    this._groupStyles['left'] = this.calcStylesByGroup('left');
    this._groupStyles['center'] = this.calcStylesByGroup('center');
    this._groupStyles['right'] = this.calcStylesByGroup('right');
    this.cd.markForCheck();
  }

  calcStylesByGroup(group: string) {
    const widths = this._columnGroupWidths;
    const offsetX = this.offsetX;

    const styles = {
      width: `${widths[group]}px`
    };

    if (group === 'left') {
      translateXY(styles, offsetX, 0);
    } else if (group === 'right') {
      const bodyWidth = parseInt(this.innerWidth + '', 0);
      const totalDiff = widths.total - bodyWidth;
      const offsetDiff = totalDiff - offsetX;
      const offset = (offsetDiff + this.scrollbarHelper.width) * -1;
      translateXY(styles, offset, 0);
    }

    return styles;
  }

  onActivate(event: any, index: number): void {
    event.cellIndex = index;
    event.rowElement = this._element;
    this.activate.emit(event);
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const keyCode = event.keyCode;
    const isTargetRow = event.target === this._element;

    const isAction =
      keyCode === Keys.return ||
      keyCode === Keys.down ||
      keyCode === Keys.up ||
      keyCode === Keys.left ||
      keyCode === Keys.right;

    if (isAction && isTargetRow) {
      event.preventDefault();
      event.stopPropagation();

      this.activate.emit({
        type: 'keydown',
        event,
        row: this.row,
        rowElement: this._element
      });
    }
  }

  @HostListener('mouseenter', ['$event'])
  onMouseenter(event: any): void {
    this.activate.emit({
        type: 'mouseenter',
        event,
        row: this.row,
        rowElement: this._element
      });
  }

  recalculateColumns(val: any[] = this.columns): void {
    this._columns = val;
    const colsByPin = columnsByPin(this._columns);
    this._columnsByPin = allColumnsByPinArr(this._columns);
    // console.log('recalculateColumns');
    // this.rowSharedData.columnResizeMap && this.rowSharedData.columnResizeMap.forEach((collapsed, i) => this._columnsByPin[1].columns[i]._inViewbox = collapsed);
    this._columnGroupWidths = columnGroupWidths(colsByPin, this._columns);
    this.cd.markForCheck();
  }

}
