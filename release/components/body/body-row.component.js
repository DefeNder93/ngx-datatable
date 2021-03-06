"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var utils_1 = require("../../utils");
var services_1 = require("../../services");
var events_1 = require("../../events");
var Subject_1 = require("rxjs/Subject");
var row_shared_data_service_1 = require("../../services/row-shared-data.service");
var BehaviorSubject_1 = require("rxjs/BehaviorSubject");
var ReplaySubject_1 = require("rxjs/ReplaySubject");
var Observable_1 = require("rxjs/Observable");
require("rxjs/add/observable/of");
require("rxjs/add/observable/combineLatest");
require("rxjs/add/operator/takeUntil");
require("rxjs/add/operator/startWith");
require("rxjs/add/operator/map");
var DataTableBodyRowComponent = /** @class */ (function () {
    function DataTableBodyRowComponent(differs, scrollbarHelper, cd, rowSharedData, element) {
        var _this = this;
        this.differs = differs;
        this.scrollbarHelper = scrollbarHelper;
        this.cd = cd;
        this.rowSharedData = rowSharedData;
        this.responsive$ = new BehaviorSubject_1.BehaviorSubject(false);
        this.columns$ = new BehaviorSubject_1.BehaviorSubject([]);
        this._columnsResize = new Subject_1.Subject();
        this.getColumnsObserverable = function (reversed) {
            if (reversed === void 0) { reversed = false; }
            return Observable_1.Observable.combineLatest(_this.columns$.asObservable(), _this._columnsResize.startWith(null)).map(function (_a) {
                var columns = _a[0], columnsResize = _a[1];
                return columnsResize ? columns.filter(function (e, i) { return reversed ? !columnsResize[i] : columnsResize[i]; }) : columns;
            });
        };
        this.visibleColumns$ = this.getColumnsObserverable();
        this.collapsedColumns$ = this.getColumnsObserverable(true);
        this.destroy$ = new ReplaySubject_1.ReplaySubject(1);
        this.toggleColumnExpand = function (e) { return _this._row.__column_expanded__ = !_this._row.__column_expanded__; };
        this.activate = new core_1.EventEmitter();
        this._groupStyles = {
            left: {},
            center: {},
            right: {}
        };
        this._element = element.nativeElement;
        this._rowDiffer = differs.find({}).create();
    }
    DataTableBodyRowComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.columnsResize
            .takeUntil(this.destroy$)
            .subscribe(function (resizeMap) {
            _this.responsive$.next(resizeMap.indexOf(false) !== -1);
            _this._columnsResize.next(resizeMap);
        });
    };
    DataTableBodyRowComponent.prototype.ngOnDestroy = function () {
        this.destroy$.next(null);
    };
    Object.defineProperty(DataTableBodyRowComponent.prototype, "columns", {
        get: function () {
            return this._columns;
        },
        set: function (val) {
            this._columns = val;
            this.recalculateColumns(val);
            this.buildStylesByGroup();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataTableBodyRowComponent.prototype, "innerWidth", {
        get: function () {
            return this._innerWidth;
        },
        set: function (val) {
            if (this._columns) {
                var colByPin = utils_1.columnsByPin(this._columns);
                this._columnGroupWidths = utils_1.columnGroupWidths(colByPin, colByPin);
            }
            this._innerWidth = val;
            this.recalculateColumns();
            this.buildStylesByGroup();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataTableBodyRowComponent.prototype, "row", {
        get: function () {
            return this._row;
        },
        set: function (val) {
            this._row = val;
            this._row.__column_expanded__ = false;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataTableBodyRowComponent.prototype, "offsetX", {
        get: function () { return this._offsetX; },
        set: function (val) {
            this._offsetX = val;
            this.buildStylesByGroup();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataTableBodyRowComponent.prototype, "cssClass", {
        get: function () {
            var cls = 'datatable-body-row';
            if (this.isSelected)
                cls += ' active';
            if (this.rowIndex % 2 !== 0)
                cls += ' datatable-row-odd';
            if (this.rowIndex % 2 === 0)
                cls += ' datatable-row-even';
            if (this.rowClass) {
                var res = this.rowClass(this.row);
                if (typeof res === 'string') {
                    cls += " " + res;
                }
                else if (typeof res === 'object') {
                    var keys = Object.keys(res);
                    for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                        var k = keys_1[_i];
                        if (res[k] === true)
                            cls += " " + k;
                    }
                }
            }
            return cls;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataTableBodyRowComponent.prototype, "columnsTotalWidths", {
        get: function () {
            return this._columnGroupWidths.total;
        },
        enumerable: true,
        configurable: true
    });
    DataTableBodyRowComponent.prototype.ngDoCheck = function () {
        if (this._rowDiffer.diff(this._row)) {
            this.cd.markForCheck();
        }
    };
    DataTableBodyRowComponent.prototype.trackByGroups = function (index, colGroup) {
        return colGroup.type;
    };
    DataTableBodyRowComponent.prototype.columnTrackingFn = function (index, column) {
        return column.$$id;
    };
    DataTableBodyRowComponent.prototype.buildStylesByGroup = function () {
        this._groupStyles['left'] = this.calcStylesByGroup('left');
        this._groupStyles['center'] = this.calcStylesByGroup('center');
        this._groupStyles['right'] = this.calcStylesByGroup('right');
        this.cd.markForCheck();
    };
    DataTableBodyRowComponent.prototype.calcStylesByGroup = function (group) {
        var widths = this._columnGroupWidths;
        var offsetX = this.offsetX;
        var styles = {
            width: widths[group] + "px"
        };
        if (group === 'left') {
            utils_1.translateXY(styles, offsetX, 0);
        }
        else if (group === 'right') {
            var bodyWidth = parseInt(this.innerWidth + '', 0);
            var totalDiff = widths.total - bodyWidth;
            var offsetDiff = totalDiff - offsetX;
            var offset = (offsetDiff + this.scrollbarHelper.width) * -1;
            utils_1.translateXY(styles, offset, 0);
        }
        return styles;
    };
    DataTableBodyRowComponent.prototype.onActivate = function (event, index) {
        event.cellIndex = index;
        event.rowElement = this._element;
        this.activate.emit(event);
    };
    DataTableBodyRowComponent.prototype.onKeyDown = function (event) {
        var keyCode = event.keyCode;
        var isTargetRow = event.target === this._element;
        var isAction = keyCode === utils_1.Keys.return ||
            keyCode === utils_1.Keys.down ||
            keyCode === utils_1.Keys.up ||
            keyCode === utils_1.Keys.left ||
            keyCode === utils_1.Keys.right;
        if (isAction && isTargetRow) {
            event.preventDefault();
            event.stopPropagation();
            this.activate.emit({
                type: 'keydown',
                event: event,
                row: this._row,
                rowElement: this._element
            });
        }
    };
    DataTableBodyRowComponent.prototype.onMouseenter = function (event) {
        this.activate.emit({
            type: 'mouseenter',
            event: event,
            row: this._row,
            rowElement: this._element
        });
    };
    DataTableBodyRowComponent.prototype.recalculateColumns = function (val) {
        if (val === void 0) { val = this.columns; }
        this._columns = val;
        var colsByPin = utils_1.columnsByPin(this._columns);
        this._columnsByPin = utils_1.allColumnsByPinArr(this._columns);
        this._columnGroupWidths = utils_1.columnGroupWidths(colsByPin, this._columns);
        this.columns$.next(this._columnsByPin[1].columns);
        // this.cd.markForCheck();
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", Subject_1.Subject)
    ], DataTableBodyRowComponent.prototype, "columnsResize", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Array)
    ], DataTableBodyRowComponent.prototype, "sorts", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Array),
        __metadata("design:paramtypes", [Array])
    ], DataTableBodyRowComponent.prototype, "columns", null);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Number),
        __metadata("design:paramtypes", [Number])
    ], DataTableBodyRowComponent.prototype, "innerWidth", null);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], DataTableBodyRowComponent.prototype, "expanded", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object)
    ], DataTableBodyRowComponent.prototype, "rowClass", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object),
        __metadata("design:paramtypes", [Object])
    ], DataTableBodyRowComponent.prototype, "row", null);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object)
    ], DataTableBodyRowComponent.prototype, "group", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], DataTableBodyRowComponent.prototype, "isSelected", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Number)
    ], DataTableBodyRowComponent.prototype, "rowIndex", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object)
    ], DataTableBodyRowComponent.prototype, "displayCheck", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Number),
        __metadata("design:paramtypes", [Number])
    ], DataTableBodyRowComponent.prototype, "offsetX", null);
    __decorate([
        core_1.HostBinding('class'),
        __metadata("design:type", Object),
        __metadata("design:paramtypes", [])
    ], DataTableBodyRowComponent.prototype, "cssClass", null);
    __decorate([
        core_1.HostBinding('style.height.px'),
        core_1.Input(),
        __metadata("design:type", Number)
    ], DataTableBodyRowComponent.prototype, "rowHeight", void 0);
    __decorate([
        core_1.HostBinding('style.width.px'),
        __metadata("design:type", String),
        __metadata("design:paramtypes", [])
    ], DataTableBodyRowComponent.prototype, "columnsTotalWidths", null);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], DataTableBodyRowComponent.prototype, "activate", void 0);
    __decorate([
        core_1.HostListener('keydown', ['$event']),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", void 0)
    ], DataTableBodyRowComponent.prototype, "onKeyDown", null);
    __decorate([
        core_1.HostListener('mouseenter', ['$event']),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", void 0)
    ], DataTableBodyRowComponent.prototype, "onMouseenter", null);
    DataTableBodyRowComponent = __decorate([
        core_1.Component({
            selector: 'datatable-body-row',
            changeDetection: core_1.ChangeDetectionStrategy.OnPush,
            template: "\n    <div\n      class=\"datatable-row-center datatable-row-group\"\n      style=\"flex-direction: column\"\n      [ngStyle]=\"_groupStyles['center']\">\n\n      <div class=\"datatable-main-row\">\n        <datatable-body-cell\n          *ngFor=\"let column of visibleColumns$ | async; let ii = index; trackBy: columnTrackingFn\"\n          tabindex=\"-1\"\n          [row]=\"_row\"\n          [sorts]=\"sorts\"\n          [group]=\"group\"\n          [responsive]=\"responsive$ | async\"\n          [expanded]=\"expanded\"\n          [columnExpanded]=\"_row.__column_expanded__\"\n          [isSelected]=\"isSelected\"\n          [columnIndex]=\"ii\"\n          [rowIndex]=\"rowIndex\"\n          [column]=\"column\"\n          [rowHeight]=\"rowHeight\"\n          [displayCheck]=\"displayCheck\"\n          (toggleColumnExpand)=\"toggleColumnExpand($event)\"\n          (activate)=\"onActivate($event, ii)\">\n        </datatable-body-cell>\n      </div>\n\n      <div *ngIf=\"_row.__column_expanded__\" class=\"datatable-responsive-row\">\n        <datatable-body-cell\n          *ngFor=\"let column of collapsedColumns$ | async; let ii = index; trackBy: columnTrackingFn\"\n          tabindex=\"-1\"\n          [row]=\"_row\"\n          [sorts]=\"sorts\"\n          [group]=\"group\"\n          [expanded]=\"expanded\"\n          [isSelected]=\"isSelected\"\n          [rowIndex]=\"rowIndex\"\n          [column]=\"column\"\n          [rowHeight]=\"rowHeight\"\n          [displayCheck]=\"displayCheck\"\n          (activate)=\"onActivate($event, ii)\">\n        </datatable-body-cell>\n      </div>\n    </div>      \n  ",
            styles: ["\n    .datatable-responsive-row {\n      display: flex; \n      flex-direction: column;\n    }\n    .datatable-main-row {\n      display: flex;\n    }\n    .datatable-responsive-row /deep/ .datatable-body-column-name {\n      display: inline-block;\n      padding-right: 10px;\n      min-width: 170px;\n    }\n    .datatable-responsive-row /deep/ .datatable-body-cell-label {\n      display: inline-block;\n    }\n  "]
        }),
        __param(1, core_1.SkipSelf()),
        __metadata("design:paramtypes", [core_1.KeyValueDiffers,
            services_1.ScrollbarHelper,
            core_1.ChangeDetectorRef,
            row_shared_data_service_1.RowSharedData,
            core_1.ElementRef])
    ], DataTableBodyRowComponent);
    return DataTableBodyRowComponent;
}());
exports.DataTableBodyRowComponent = DataTableBodyRowComponent;
//# sourceMappingURL=body-row.component.js.map