import {Component, OnInit, Output, EventEmitter, Input, OnDestroy} from '@angular/core';
import { DateFilterService } from '../date-filter.service';
import * as d3 from 'd3';
import {formatDefaultDate, oneDay} from '../common/dateFormats';

@Component({
  selector: 'app-date-slider',
  templateUrl: './date-slider.component.html',
  styleUrls: ['./date-slider.component.css']
})
export class DateSliderComponent implements OnInit, OnDestroy {
  formatDateShort; // display dates
  fromDateDisp;
  toDateDisp;
  dateScale;
  maxNum = 20;
  valFrom;
  valTo;
  style;
  styleBack;
  dateRange = [1, this.maxNum];
  singleDate = this.maxNum;
  toolTipFormat;
  ready;
  @Input () single: boolean;
  @Input () small: boolean;
  @Input () fromDateObj: Date;
  @Input () toDateObj: Date;
  @Output() dateFilterChange = new EventEmitter<any>();

  constructor(private dateFilterService: DateFilterService) { }

  ngOnInit() {
    // get the relevant lineMin and max dates
    this.dateFilterService.lowerDate.subscribe( lowerDate => {this.fromDateObj = lowerDate; this.updateRange(); });
    this.dateFilterService.upperDate.subscribe( upperDate => {this.toDateObj = upperDate; this.updateRange(); });

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
      // display lineMin and max date
      this.fromDateDisp = formatDefaultDate(this.fromDateObj);
      this.toDateDisp = formatDefaultDate(this.toDateObj);

      this.initSelection();

      // date scale
      this.dateScale = d3.scaleTime()
        .domain([1, this.maxNum])
        .range([this.fromDateObj, this.toDateObj]);

      this.toolTipFormat = {
        to: (v) => {
          return formatDefaultDate(this.dateScale(v));
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
