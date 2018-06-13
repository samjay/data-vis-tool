import { Component, OnInit, Input } from '@angular/core';
import { Sensor } from '../models/sensor';
import { DateFilterService } from '../date-filter.service';
import * as d3 from 'd3';
import {DataFileService} from '../data-file.service';
import {height, margin, width} from '../common/svg-dimensions';
import {xRange, yRange} from '../common/range';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit {

  readData = [];
  preparedData = [];
  prepared;
  padding = 25;
  svgContainer;
  parseDate;
  fromDateDisp;
  toDateDisp;

  constructor(private dateFilterService: DateFilterService,
              private dataService: DataFileService) { }

  @Input() sensor: Sensor;

  ngOnInit() {
    this.svgContainer = d3.select('#lineChart').append('svg').attr('width', width)
      .attr('height', height).style('border', '1px solid black');
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

    this.readData.forEach((d) => {
      this.parseDate = d3.timeParse('%m/%d/%Y %H:%M:%S');
      if (d.SITE_ID === 'BBE401') {
        this.preparedData.push({'date': this.parseDate(d.DATEOFF), 'y': d.SO4_CONC});
      }
    });
    if (!full) {
      this.parseDate = d3.timeParse('%m/%d/%Y');
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
    this.svgContainer = d3.select('#lineChart').append('svg').attr('width', width)
      .attr('height', height).style('border', '1px solid black');

    // x-axis
    const xAxisScale = d3.scaleTime()
      .domain([this.preparedData[0].date, this.preparedData[this.preparedData.length - 1].date])
      .rangeRound(xRange);
    const xAxis = d3.axisBottom(xAxisScale).tickFormat(d3.timeFormat('%b %y')).ticks(10).tickPadding(2);

    // y-axis
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(this.preparedData, (d) => d.y)])
      .range(yRange);
    const yAxis = d3.axisLeft(yScale);

    // Add grid
    this.svgContainer.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(yScale)
        .tickSize(- width, 0, 0)
        .tickFormat('')
      );

    // Add Axis
    this.svgContainer.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + (height - margin.bottom) + ')')
      .call(xAxis);
    this.svgContainer.append('g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(' + (margin.left - 10) + ', 0)')
      .call(yAxis);

    // Draw Line
    const xScale = d3.scaleTime()
      .domain(d3.extent(this.preparedData, (d) => d.date))
      .range(xRange);
    const lineFunction = d3.line().x(d => xScale(d.date)).y(d => yScale(d.y));
    this.svgContainer.append('path').attr('d', lineFunction(this.preparedData)).attr('stroke', 'blue')
      .attr('stroke-width', 1).attr('fill', 'none');
  }

  onDateRangeChange(dateRange: any) {
    this.toDateDisp = dateRange.to;
    this.fromDateDisp = dateRange.from;
    this.prepare(false, dateRange.from, dateRange.to);
    this.draw();
  }


}
