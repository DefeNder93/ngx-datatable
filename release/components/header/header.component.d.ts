import { EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { SortType, SelectionType } from '../../types';
import { DataTableColumnDirective } from '../columns';
import { Subject } from "rxjs/Subject";
export declare class DataTableHeaderComponent implements OnInit {
    private cd;
    ngOnInit(): void;
    constructor(cd: ChangeDetectorRef);
    sortAscendingIcon: any;
    sortDescendingIcon: any;
    scrollbarH: boolean;
    dealsWithGroup: boolean;
    stickyHeader: boolean;
    columnsResize: Subject<any>;
    _innerWidth: number;
    innerWidth: number;
    sorts: any[];
    sortType: SortType;
    allRowsSelected: boolean;
    selectionType: SelectionType;
    reorderable: boolean;
    dragEventTarget: any;
    headerHeight: any;
    columns: any[];
    offsetX: number;
    sort: EventEmitter<any>;
    reorder: EventEmitter<any>;
    resize: EventEmitter<any>;
    select: EventEmitter<any>;
    columnContextmenu: EventEmitter<{
        event: MouseEvent;
        column: any;
    }>;
    _columnsByPin: any;
    _columnGroupWidths: any;
    _offsetX: number;
    _columns: any[];
    _headerHeight: string;
    _styleByGroup: {
        left: {};
        center: {};
        right: {};
    };
    onLongPressStart({event, model}: {
        event: any;
        model: any;
    }): void;
    onLongPressEnd({event, model}: {
        event: any;
        model: any;
    }): void;
    readonly headerWidth: string;
    trackByGroups(index: number, colGroup: any): any;
    columnTrackingFn(index: number, column: any): any;
    onColumnResized(width: number, column: DataTableColumnDirective): void;
    onColumnReordered({prevIndex, newIndex, model}: any): void;
    onSort({column, prevValue, newValue}: any): void;
    calcNewSorts(column: any, prevValue: number, newValue: number): any[];
    setStylesByGroup(): void;
    calcStylesByGroup(group: string): any;
}
