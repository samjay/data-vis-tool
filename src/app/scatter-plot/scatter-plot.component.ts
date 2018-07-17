import { Component, OnChanges, Input } from '@angular/core';
import * as d3 from 'd3';
import {Sensor} from '../models/sensor';
import {height, margin, width} from '../common/svg-dimensions';
import {xRange, yRange} from '../common/range';
import {DateFilterService} from '../date-filter.service';
import {ChartService} from '../chart.service';
import {parseDate, parseDateSource} from '../common/dateFormats';
import {SensorLocation} from '../models/sensor-location';
import {SensorsService} from '../sensors.service';

@Component({
  selector: 'app-scatter-plot',
  templateUrl: './scatter-plot.component.html',
  styleUrls: ['./scatter-plot.component.css']
})
export class ScatterPlotComponent implements OnChanges {
  readData = [];
  preparedData = [];
  filteredData = [];
  svgContainer;
  yScale;
  xScale;
  xAxisScale;
  yAxisScale;
  yMax;
  prepared;
  selectedDate;

  constructor(private dateFilterService: DateFilterService,
              private sensorService: SensorsService,
              private chartService: ChartService) { }

  @Input() sensor: Sensor;
  @Input() location: SensorLocation;

  /**
   * Load the component each time the selected sensor in the parent sensor-list component changes
   */
  ngOnChanges() {
    if (this.svgContainer) {
      this.svgContainer.remove();
    }
    this.svgContainer = d3.select('#scatterPlot').append('svg').attr('width', width)
      .attr('height', height).style('border', '1px solid black');
    this.getData();
  }

  /**
   * Load the data
   */
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
        this.draw();
      }
    });
  }

  /**
   * Prepare the data
   */
  prepare() {
    this.preparedData = [];
    this.readData.forEach((d) => {
      this.preparedData.push({'x': d.x, 'y': d.y, 'date': parseDateSource(d.timeStamp)});
    });
    this.dateFilterService.lowerDate = this.preparedData[0].date;
    this.dateFilterService.upperDate = this.preparedData[this.preparedData.length - 1].date;
    this.prepared = true;
  }

  /**
   * Filter the data
   */
  filter() {
    // will show data within week of selected date
    const daysAfter30 = new Date();
    if (!this.selectedDate) {
      this.selectedDate = this.preparedData[0].date;
    }
    daysAfter30.setTime(this.selectedDate.getTime() + (30 * 24 * 60 * 60 * 1000));
    this.filteredData = this.preparedData.filter((d) =>
      d.date >= this.selectedDate && d.date <= daysAfter30);
  }

  /**
   * Draw SVG
   */
  draw() {
    this.svgContainer.remove();
    this.svgContainer = d3.select('#scatterPlot').append('svg').attr('width', width)
      .attr('height', height).style('border', '1px solid black');

    this.yMax = d3.max(this.filteredData, (d) => d.y);
    this.xScale = d3.scaleLinear()
      .domain([0, d3.max(this.filteredData, (d) => d.x)])
      .range(xRange);
    this.xAxisScale = d3.scaleLinear()
      .domain([0, d3.max(this.preparedData, (d) => d.x)])
      .range(xRange);
    this.yScale = d3.scaleLinear()
      .domain([0, this.yMax])
      .range(yRange);
    this.yAxisScale = d3.scaleLinear()
      .domain([0, d3.max(this.preparedData, (d) => d.y)])
      .range(yRange);
    const xAxis = d3.axisBottom(this.xScale).ticks(5);
    const yAxis = d3.axisLeft(this.yAxisScale);

    // circles
    this.svgContainer.append('g').selectAll('circle').data(this.filteredData).enter().append('circle')
      .attr('cx', (d) => this.xScale(d.x))
      .attr('cy', (d) => this.yScale(d.y))
      .attr('r', 5).attr('fill-opacity', 0.6).attr('fill', 'blue');

    // Add Axis
    this.svgContainer.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(0,' + (height - margin.bottom) + ')')
      .call(xAxis);
    this.svgContainer.append('text').attr('class', 'axis')
      .attr('transform',
        'translate(' + (width / 2) + ' ,' +
        (height - margin.bottom + margin.top) + ')')
      .style('text-anchor', 'middle')
      .text(this.sensor.name);
    this.svgContainer.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(' + margin.left  + ', 0)')
      .call(yAxis);

    this.chartService.addMouseCursorTracker(this.svgContainer, this.xAxisScale, true, this.yAxisScale, true, height, width);
  }

  /**
   * Event responder fired when the child date filter component date range is changed
   * @param dateRange
   */
  onDateRangeChange(dateRange: any) {
    this.selectedDate = parseDate(dateRange.from);
    this.filter();
    this.draw();
  }

}
