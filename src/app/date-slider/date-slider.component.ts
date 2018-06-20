import {Component, OnInit, Output, EventEmitter, Input} from '@angular/core';
import { DateFilterService } from '../date-filter.service';
import * as d3 from 'd3';

@Component({
  selector: 'app-date-slider',
  templateUrl: './date-slider.component.html',
  styleUrls: ['./date-slider.component.css']
})
export class DateSliderComponent implements OnInit {
  formatDateShort;
  fromDateObj: Date;
  toDateObj: Date;
  fromDateDisp;
  toDateDisp;
  dateScale;
  maxNum = 20;
  valFrom;
  valTo;
  dateRange = [3, 5];
  singleDate = 1;
  toolTipFormat;
  @Input () single: boolean;
  @Output() dateFilterChange = new EventEmitter<any>();

  constructor(private dateFilterService: DateFilterService) { }

  ngOnInit() {
    // get the relevant min and max dates
    this.dateFilterService.getLowerDate().subscribe(lowerDate => this.fromDateObj = lowerDate);
    this.dateFilterService.getUpperDate().subscribe(upperDate => this.toDateObj = upperDate);

    // display min and max date
    this.formatDateShort = d3.timeFormat('%m/%d/%Y');
    this.fromDateDisp = this.formatDateShort(this.fromDateObj);
    this.toDateDisp = this.formatDateShort(this.toDateObj);

    // date difference for max num
    const oneDay = 24 * 3600 * 1000;
    const difference =  this.toDateObj.getTime() - this.fromDateObj.getTime();
    this.maxNum = Math.round(difference / oneDay);
    this.valFrom = 1;
    this.valTo = this.maxNum;
    this.dateRange = [1, this.maxNum];

    // date scale
    this.dateScale = d3.scaleTime()
      .domain([1, this.maxNum])
      .range([this.fromDateObj, this.toDateObj]);

    this.toolTipFormat = {
      to: (v) => {
      return this.formatDateShort(this.dateScale(v));
    },
      from: (v) => {
      return v; }
    };
  }

  onChange( value: any) {
    if (this.single) {
      this.dateFilterChange.emit({'from': value});
    } else {
      this.dateFilterChange.emit({'from': value[0], 'to': value[1]});
    }
  }

}
