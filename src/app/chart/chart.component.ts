import { Component, OnInit, Input } from '@angular/core';
import { Sensor } from '../models/sensor';
import { DateFilterService } from '../date-filter.service';
import * as d3 from 'd3';
import {DataFileService} from '../data-file.service';
import {height, margin, width} from '../common/svg-dimensions';
import {xRange, yRange} from '../common/range';
import {ChartService} from '../chart.service';
import {parseDate, parseDateSource} from '../common/dateFormats';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit {

  readData = [];
  preparedData = [];
  filteredData = [];
  prepared: boolean;
  svgContainer;
  fromDateDisp;
  toDateDisp;
  fromDate;
  toDate;

  constructor(private dateFilterService: DateFilterService,
              private dataService: DataFileService,
              private chartService: ChartService) { }

  @Input() sensor: Sensor;

  ngOnInit() {
    this.svgContainer = d3.select('#lineChart').append('svg').attr('width', width)
      .attr('height', height);
    this.getData();
  }

  getData() {
    this.dataService.getReadData().subscribe( dataFromService => {
      this.readData = dataFromService;
      if (this.readData.length > 0) {
        this.prepare();
        this.filter();
        this.draw();
      }
    });
  }

  prepare() {
    this.preparedData = [];

    this.readData.forEach((d) => {
      if (d.SITE_ID === this.sensor.data_key) {
        this.preparedData.push({'date': parseDateSource(d.DATEOFF), 'y': d.SO4_CONC});
      }
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
    this.svgContainer.remove();
    this.svgContainer = d3.select('#lineChart').append('svg').attr('width', width)
      .attr('height', height);

    // x-axis
    const xAxisScale = d3.scaleTime()
      .domain([this.filteredData[0].date, this.filteredData[this.filteredData.length - 1].date])
      .rangeRound(xRange);
    const xAxis = d3.axisBottom(xAxisScale).tickFormat(d3.timeFormat('%b %y')).ticks(15).tickPadding(2);

    // y-axis
    const yMax = d3.max(this.filteredData, (d) => d.y);
    const yScale = d3.scaleLinear()
      .domain([0, yMax])
      .range(yRange);
    const yAxis = d3.axisLeft(yScale);

    // Add Axis
    this.svgContainer.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + (height - margin.bottom) + ')')
      .call(xAxis);
    this.svgContainer.append('g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(' + (margin.left) + ', 0)')
      .call(yAxis);

    // Draw Line
    const xScale = d3.scaleTime()
      .domain(d3.extent(this.filteredData, (d) => d.date))
      .range(xRange);
    const lineFunction = d3.line().x(d => xScale(d.date)).y(d => yScale(d.y));
    this.svgContainer.append('path').attr('d', lineFunction(this.filteredData)).attr('stroke', 'navy')
      .attr('stroke-width', 0.7).attr('fill', 'none');

    this.chartService.addMouseCursorTracker(this.svgContainer, xAxisScale, false, yScale, true);
  }

  onDateRangeChange(dateRange: any) {
    this.toDateDisp = dateRange.to;
    this.fromDateDisp = dateRange.from;
    this.fromDate = parseDate(dateRange.from);
    this.toDate = parseDate(dateRange.to);
    this.filter();
    this.draw();
  }
}
