import { Component, OnInit, Input } from '@angular/core';
import { Sensor } from '../models/sensor';
import { DateFilterService } from '../date-filter.service';
import * as d3 from 'd3';
import {DataFileService} from '../data-file.service';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit {
  // lineData = [ { 'date': '15-Jun-16',   'y': 5},  { 'date': '15-Jul-16',  'y': 20},
  //            { 'date': '15-Aug-16',  'y': 10}, { 'date': '15-Sep-16',  'y': 40},
  //             { 'date': '15-Oct-16',  'y': 5},  { 'date': '15-Nov-16', 'y': 60},
  //   { 'date': '15-Dec-16',   'y': 40},  { 'date': '15-Jan-17',  'y': 20},
  //   { 'date': '15-Feb-17',  'y': 10}, { 'date': '15-Mar-17',  'y': 40},
  //   { 'date': '15-Apr-17',  'y': 5},  { 'date': '15-May-17', 'y': 60}];

  readData = [];
  preparedData = [];
  prepared;
  margin = {top: 20, right: 20, bottom: 50, left: 70};
  width = 960 - this.margin.left - this.margin.right;
  height = 500 - this.margin.top - this.margin.bottom;
  padding = 25;
  svgContainer;
  parseDate;
  fromDateDispC;
  toDateDispC;

  constructor(private dateFilterService: DateFilterService,
              private dataService: DataFileService) { }

  @Input() sensor: Sensor;

  ngOnInit() {
    this.svgContainer = d3.select('#lineChart').append('svg').attr('width',  this.width)
      .attr('height', this.height).style('border', '1px solid black');
    this.getData();
  }

  getData() {
    this.dataService.getReadData().subscribe( dataFromService => {
      this.readData = dataFromService;
      if (this.readData.length > 0) {
        this.prepare(true, '', '');
        this.draw();
      }
    });
  }

  prepare(full: boolean, fromDate: string, toDate: string) {
    this.preparedData = [];
    this.parseDate = d3.timeParse('%m/%d/%Y %H:%M:%S');
    this.readData.forEach((d) => {
      if (d.SITE_ID === 'BBE401') {
        this.preparedData.push({'date': this.parseDate(d.DATEOFF), 'y': d.SO4_CONC});
      }
    });
    if (!full) {
      this.preparedData = this.preparedData
        .filter((d) =>
          d.date >= this.parseDate(fromDate) && d.date <= this.parseDate(toDate));
    }
    this.dateFilterService.lowerDate = this.preparedData[0].date;
    this.dateFilterService.upperDate = this.preparedData[this.preparedData.length - 1].date;
    this.prepared = true;
  }

  draw() {
    this.svgContainer.remove();
    this.svgContainer = d3.select('#lineChart').append('svg').attr('width', this.width)
      .attr('height', this.height).style('border', '1px solid black');

    // x-axis
    const xAxisScale = d3.scaleTime()
      .domain([this.preparedData[0].date, this.preparedData[this.preparedData.length - 1].date])
      .rangeRound([this.margin.left, this.width - this.margin.right]);
    const xAxis = d3.axisBottom(xAxisScale).tickFormat(d3.timeFormat('%b %y')).ticks(10).tickPadding(2);

    // y-axis
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(this.preparedData, (d) => d.y)])
      .range([this.height - this.margin.bottom , this.margin.top]);
    const yAxis = d3.axisLeft(yScale);

    // Add grid
    this.svgContainer.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(yScale)
        .tickSize(- this.width, 0, 0)
        .tickFormat('')
      );

    // Add Axis
    this.svgContainer.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + (this.height - this.margin.bottom) + ')')
      .call(xAxis);
    this.svgContainer.append('g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(' + this.margin.top + ', 0)')
      .call(yAxis);

    // Draw Line
    const xScale = d3.scaleTime()
      .domain(d3.extent(this.preparedData, (d) => d.date))
      .range([this.margin.left, this.width - this.margin.right]);
    const lineFunction = d3.line().x(d => xScale(d.date)).y(d => yScale(d.y)).curve(d3.curveBasis);
    this.svgContainer.append('path').attr('d', lineFunction(this.preparedData)).attr('stroke', 'blue')
      .attr('stroke-width', 1).attr('fill', 'none');
  }

  onDateRangeChange(dateRange: any) {
    this.toDateDispC = dateRange.to;
    this.fromDateDispC = dateRange.from;
    this.prepare(false, dateRange.from, dateRange.to);
    this.draw();
  }


}
