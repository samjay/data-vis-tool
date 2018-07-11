import { Component, OnInit, Input, OnChanges, OnDestroy } from '@angular/core';
import { Sensor } from '../models/sensor';
import { DateFilterService } from '../date-filter.service';
import * as d3 from 'd3';
import {height, heightSmall, margin, width, widthSmall} from '../common/svg-dimensions';
import {ChartService} from '../chart.service';
import {parseDate, parseDateSource} from '../common/dateFormats';
import {SensorLocation} from '../models/sensor-location';
import {SensorsService} from '../sensors.service';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnChanges, OnInit, OnDestroy {

  readData = [];
  preparedData = [];
  filteredData = [];
  prepared: boolean;
  svgContainer;
  fromDateDisp;
  toDateDisp;
  fromDate;
  toDate;
  chartId;
  dataReady = false;
  realTimeId;

  constructor(private dateFilterService: DateFilterService,
              private sensorService: SensorsService,
              private chartService: ChartService) { }

  @Input() sensor: Sensor;
  @Input() location: SensorLocation;
  @Input() sizeSmall: boolean;

  ngOnInit() {
    if (this.sensor) {
      this.chartId = 'lineChart' + this.sensor.id + Math.round(Math.random() * 10);
    }
    this.realTimeUpdate();
  }

  ngOnChanges() {
    this.getData();
  }

  getData() {
    // TODO temp adjustment to cycle through locations, for demo
    if (this.location.id > 3) {
      this.location.id = (this.location.id % 3) + 1;
    }
    this.sensorService.getSensorData(this.location.id + '' + this.sensor.id).subscribe( sensorData => {
      this.readData = sensorData.data;
      if (this.readData.length > 0) {
        this.prepare();
        this.filter();
        this.dataReady = true;
        this.draw();
      }
    });
  }

  prepare() {
    this.preparedData = [];

    this.readData.forEach((d) => {
      this.preparedData.push({'date': parseDateSource(d.timeStamp), 'y': d.x});
    });
    this.fromDate = this.preparedData[0].date;
    this.toDate = this.preparedData[this.preparedData.length - 1].date;
    this.prepared = true;
  }

  filter() {
      this.filteredData = this.preparedData
        .filter((d) =>
          d.date >= this.fromDate && d.date <= this.toDate);
    this.dateFilterService.lowerDate = this.filteredData[0].date;
    this.dateFilterService.upperDate = this.filteredData[this.filteredData.length - 1].date;
  }

  draw() {
    let _width;
    let _height;
    if (this.svgContainer) {
      this.svgContainer.remove();
    }

    if (this.sizeSmall) {
        _width = widthSmall;
        _height = heightSmall;
    } else {
      _width = width;
      _height = height;
    }
    const _xRange = [margin.left, _width - margin.right];
    const _yRange = [_height - margin.bottom, margin.bottom];

    this.svgContainer = d3.select('#' + this.chartId).append('svg').attr('width', _width)
      .attr('height', _height);

    // x-axis
    const xAxisScale = d3.scaleTime()
      .domain([this.filteredData[0].date, this.filteredData[this.filteredData.length - 1].date])
      .rangeRound(_xRange);
    const xAxis = d3.axisBottom(xAxisScale).tickFormat(d3.timeFormat('%b %y')).ticks(15).tickPadding(2);

    // y-axis
    const yMax = d3.max(this.filteredData, (d) => d.y);
    const yScale = d3.scaleLinear()
      .domain([0, yMax])
      .range(_yRange);
    const yAxis = d3.axisLeft(yScale);

    // Add Axis
    this.svgContainer.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + (_height - margin.bottom) + ')')
      .call(xAxis);
    this.svgContainer.append('g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(' + (margin.left) + ', 0)')
      .call(yAxis);

    // Draw Line
    const xScale = d3.scaleTime()
      .domain(d3.extent(this.filteredData, (d) => d.date))
      .range(_xRange);
    const lineFunction = d3.line().x(d => xScale(d.date)).y(d => yScale(d.y));
    this.svgContainer.append('path').attr('d', lineFunction(this.filteredData)).attr('stroke', 'navy')
      .attr('stroke-width', 0.7).attr('fill', 'none');

    this.chartService.addMouseCursorTracker(this.svgContainer, xAxisScale, false, yScale, true, _height, _width);
  }

  realTimeUpdate() { // TODO polling service
    this.realTimeId = window.setInterval(() => {
     this.getData();
    }, 4000);
  }

  onDateRangeChange(dateRange: any) {
    this.toDateDisp = dateRange.to;
    this.fromDateDisp = dateRange.from;
    this.fromDate = parseDate(dateRange.from);
    this.toDate = parseDate(dateRange.to);
    this.filter();
    this.draw();
  }

  ngOnDestroy() {
    if (this.realTimeId) {
      window.clearInterval(this.realTimeId);
    }
  }
}
