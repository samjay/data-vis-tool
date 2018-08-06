import {Component, OnInit, Output, EventEmitter, Input, OnDestroy} from '@angular/core';
import { DateFilterService } from '../date-filter.service';
import * as d3 from 'd3';

@Component({
  selector: 'app-date-slider',
  templateUrl: './date-slider.component.html',
  styleUrls: ['./date-slider.component.css']
})
export class DateSliderComponent implements OnInit, OnDestroy {
  formatDateShort;
  fromDateDisp;
  toDateDisp;
  dateScale;
  maxNum = 20;
  valFrom;
  valTo;
  style;
  styleBack;
  dateRange = [1, 20];
  singleDate = 20;
  toolTipFormat;
  ready;
  @Input () single: boolean;
  @Input () small: boolean;
  @Input () fromDateObj: Date;
  @Input () toDateObj: Date;
  @Output() dateFilterChange = new EventEmitter<any>();

  constructor(private dateFilterService: DateFilterService) { }

  ngOnInit() {
    // get the relevant min and max dates
    this.dateFilterService.lowerDate.subscribe( lowerDate => {this.fromDateObj = lowerDate; this.updateRange(); });
    // this.dateFilterService.getLowerDate().subscribe(lowerDate => this.fromDateObj = lowerDate);
    this.dateFilterService.upperDate.subscribe( upperDate => {this.toDateObj = upperDate; this.updateRange(); });
    // this.dateFilterService.getUpperDate().subscribe(upperDate => this.toDateObj = upperDate);

    if (this.small) {
      this.style = 'size-small';
      this.styleBack = 'size-small-back';
    } else {
      this.style = 'size-normal';
      this.styleBack = 'size-normal-back';
    }
    this.updateRange();
  }

  updateRange() {
    if (this.toDateObj && this.fromDateObj) {
      // display min and max date
      this.formatDateShort = d3.timeFormat('%m/%d/%Y');
      this.fromDateDisp = this.formatDateShort(this.fromDateObj);
      this.toDateDisp = this.formatDateShort(this.toDateObj);

      this.initSelection();

      // date scale
      this.dateScale = d3.scaleTime()
        .domain([1, this.maxNum])
        .range([this.fromDateObj, this.toDateObj]);

      this.toolTipFormat = {
        to: (v) => {
          return this.formatDateShort(this.dateScale(v));
        },
        from: (v) => {
          return v;
        }
      };

      this.ready = true;
    }
  }

  initSelection() {
    // date difference for max num
    const oneDay = 24 * 3600 * 1000;
    const difference = this.toDateObj.getTime() - this.fromDateObj.getTime();
    this.maxNum = Math.round(difference / oneDay);
    this.valFrom = 1;
    this.valTo = this.maxNum;
    this.dateRange = [1, this.maxNum];
    this.singleDate = this.maxNum;
  }

  /**
   * Event emiter to send value changes to listeners.
   * @param value
   */
  onChange( value: any) {
    if (this.single) {
      this.dateFilterChange.emit({'from': value});
    } else {
      this.dateFilterChange.emit({'from': value[0], 'to': value[1]});
    }
  }

  ngOnDestroy() {
  }
}
