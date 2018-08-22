import { Component, OnInit, Input, OnChanges, OnDestroy } from '@angular/core';
import { Sensor } from '../models/sensor';
import { DateFilterService } from '../date-filter.service';
import * as d3 from 'd3';
import {axisLabelPadding, height, heightSmall, margin, width, widthSmall} from '../common/svg-dimensions';
import {ChartService} from '../chart.service';
import {SensorLocation} from '../models/sensor-location';
import {SensorsService} from '../sensors.service';
import {PollingService} from '../polling.service';
import {formatAxisDate, parseDefaultDate, parseSourceDate} from '../common/dateFormats';
import {NgProgress} from 'ngx-progressbar';

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
  toDateMax;
  chartId;
  dataReady = false;
  seek = false;
  pollingSubscription;

  constructor(private dateFilterService: DateFilterService,
              private sensorService: SensorsService,
              private pollingService: PollingService,
              private chartService: ChartService,
              public ngProgress: NgProgress) { }

  @Input() sensor: Sensor;
  @Input() location: SensorLocation;
  @Input() sizeSmall: boolean;

  ngOnInit() {
    // generate chart ID s for uniqueness
    if (this.sensor) {
      this.chartId = 'lineChart' + this.sensor.id + Math.round(Math.random() * 10);
    }
    this.ngProgress.start();
    this.pollingSubscription = this.pollingService.pollingItem.subscribe(() => {
      this.getData();
    });
    this.pollingService.startPolling();
  }

  ngOnChanges() {
    this.ngProgress.start();
    this.getData();
  }

  getData() {
    // TODO temp adjustment to cycle through locations, for demo
    if (this.location.id > 4) {
      this.location.id = (this.location.id % 4) + 1;
    }
    this.sensorService.getSensorData(this.location.id + '' + this.sensor.id).subscribe( sensorData => {
      this.readData = sensorData.data;
      if (this.readData.length > 0) {
        this.prepare();
        this.filter();
        this.dataReady = true;
        this.draw();
        this.ngProgress.done();
      }
    });
  }

  prepare() {
    this.preparedData = [];
    this.readData.forEach((d) => {
      this.preparedData.push({'date': parseSourceDate(d.timeStamp), 'y': d.x});
    });
    this.fromDate = this.preparedData[0].date;
    this.toDateMax = this.preparedData[this.preparedData.length - 1].date;
    this.dateFilterService.setLowerDate(this.fromDate);
    this.dateFilterService.setUpperDate(this.toDateMax);
    this.prepared = true;
  }

  filter() {
      this.filteredData = this.preparedData
        .filter((d) =>
          d.date >= this.fromDate && d.date <= this.toDateMax);

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

    this.svgContainer = d3.select('#' + this.chartId).append('svg');
    this.chartService.svgDimensionInit(this.svgContainer, _width, _height);

    // x-axis
    const xAxisScale = d3.scaleTime()
      .domain([this.filteredData[0].date, this.filteredData[this.filteredData.length - 1].date])
      .rangeRound(_xRange);
    const xAxis = d3.axisBottom(xAxisScale).tickFormat(formatAxisDate);

    // y-axis
    const yMax = d3.max(this.filteredData, (d) => d.y);
    const yScale = d3.scaleLinear()
      .domain([0, yMax])
      .range(_yRange);
    const yAxis = d3.axisLeft(yScale);

    // text label for the y axis
    this.svgContainer.append('text').attr('class', 'axis')
      .attr('transform',
        'translate(' + (margin.left - axisLabelPadding.left) + ' ,' +
        (margin.top + axisLabelPadding.top) + ')')
      .style('text-anchor', 'middle')
      .text(this.sensor.unit);

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
    this.svgContainer.append('path').attr('class', 'chart').attr('d', lineFunction(this.filteredData));

    this.chartService.addMouseCursorTracker(this.svgContainer, xAxisScale,
      false, yScale, true, _height, _width);
  }

  onDateRangeChange(dateRange: any) {
    this.toDateDisp = dateRange.to;
    this.fromDateDisp = dateRange.from;
    this.fromDate = parseDefaultDate(dateRange.from);
    this.toDateMax = parseDefaultDate(dateRange.to);
    this.filter();
    this.draw();
  }

  toggleSeek() {
    this.seek = !this.seek;

    if (this.seek) {
      this.pollingService.stopPolling();
    } else {
      this.getData();
      this.pollingService.startPolling();
    }
  }

  ngOnDestroy() {
    this.pollingService.stopPolling();
    this.pollingSubscription.unsubscribe();
  }
}
