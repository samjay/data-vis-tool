import { Component, OnInit, Input } from '@angular/core';
import { DateFilterService } from '../date-filter.service';
import * as d3 from 'd3';

@Component({
  selector: 'app-date-slider',
  templateUrl: './date-slider.component.html',
  styleUrls: ['./date-slider.component.css']
})
export class DateSliderComponent implements OnInit {

  formatDate;
  fromDateObj: Date;
  toDateObj: Date;
  fromDateDisp;
  toDateDisp;
  dateScale;
  minNum = 0;
  maxNum = 20;

  constructor(private dateFilterService: DateFilterService) { }

  ngOnInit() {
    // get the relevant min and max dates
    this.dateFilterService.getLowerDate().subscribe(lowerDate => this.fromDateObj = lowerDate);
    this.dateFilterService.getUpperDate().subscribe(upperDate => this.toDateObj = upperDate);

    // display min and max date
    this.formatDate = d3.timeFormat('%d-%b-%y');
    this.fromDateDisp = this.formatDate(this.fromDateObj);
    this.toDateDisp = this.formatDate(this.toDateObj);

    // date difference for max num
    const oneDay = 24 * 3600 * 1000;
    const difference =  this.toDateObj.getTime() - this.fromDateObj.getTime();
    this.maxNum = Math.round(difference / oneDay);
    console.log(this.maxNum);

    // date scale
    this.dateScale = d3.scaleTime()
      .domain([1, this.maxNum])
      .range([this.fromDateObj, this.toDateObj]);
  }

  updateValLow(value: number) {
    this.fromDateDisp = this.formatDate(this.dateScale(this.maxNum / 2 - value));
  }

  updateValHigh(value: number) {
    this.toDateDisp = this.formatDate(this.dateScale(value));
  }
}
