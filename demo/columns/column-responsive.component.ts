import { Component } from '@angular/core';

@Component({
  selector: 'column-responsive-demo',
  template: `
    <div>
      <h3>
        Fixed Column Widths
        <small>
          <a href="https://github.com/swimlane/ngx-datatable/blob/master/demo/columns/column-standard.component.ts" target="_blank">
            Source
          </a>
        </small>
      </h3>
      <ngx-datatable
        class="material"
        [rows]="rows"
        [columnMode]="'force'"
        [headerHeight]="50"
        [footerHeight]="50"
        [alwaysShownColumns]="[0]"
        [responsive]="true"
        [rowHeight]="'auto'">
        <ngx-datatable-column name="Name" [minWidth]="200">
          <ng-template let-value="value" ngx-datatable-cell-template>
            {{value}}
          </ng-template>
        </ngx-datatable-column>
        <ngx-datatable-column name="Gender" [minWidth]="200">
          <ng-template let-row="row" let-value="value" ngx-datatable-cell-template>
            {{value}}
          </ng-template>
        </ngx-datatable-column>
        <ngx-datatable-column name="Age" [minWidth]="200">
          <ng-template let-value="value" ngx-datatable-cell-template>
            {{value}}
          </ng-template>
        </ngx-datatable-column>
        <ngx-datatable-column name="Favorite Color" prop="color" [minWidth]="200">
          <ng-template let-value="value" ngx-datatable-cell-template>
            {{value}}
          </ng-template>
        </ngx-datatable-column>
        <ngx-datatable-column name="Description" [minWidth]="200">
          <ng-template let-value="value" ngx-datatable-cell-template>
            {{value}}
          </ng-template>
        </ngx-datatable-column>
      </ngx-datatable>
    </div>
  `
})
export class ColumnResponsiveComponent {

  rows = [];

  constructor() {
    this.fetch((data) => {
      this.rows = data.splice(0, 5);
    });
  }

  fetch(cb) {
    const req = new XMLHttpRequest();
    req.open('GET', `assets/data/company.json`);

    req.onload = () => {
      cb(JSON.parse(req.response));
    };

    req.send();
  }

}
