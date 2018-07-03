import { Component, OnChanges, Input } from '@angular/core';
import * as d3 from 'd3';
import {Sensor} from '../models/sensor';
import {height, margin, width} from '../common/svg-dimensions';
import {xRange} from '../common/range';
import {ChartService} from '../chart.service';
import {SensorLocation} from '../models/sensor-location';
import {SensorsService} from '../sensors.service';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.css']
})
export class BarChartComponent implements OnChanges {

  readData;
  preparedData;
  svgContainer;
  xScale;
  yScale;
  maxData;
  barPadding = 1;

  @Input() sensor: Sensor;
  @Input() location: SensorLocation;

  constructor(private chartService: ChartService,
              private sensorService: SensorsService) { }

  ngOnChanges() {
    if (this.svgContainer) {
      this.svgContainer.remove();
    }
    this.svgContainer = d3.select('#barChart').append('svg').attr('width', width)
      .attr('height', height);
    this.getData();

    // read data (this needs to be passed from sensor list, which location, which sensor id)
    d3.csv('assets/baseball_data.csv').then((data) => {
      this.readData = data;
      this.prepare();
      this.draw();
    });
  }

  getData() {
    // temp adjustment to cycle through locations
    if (this.location.id > 3) {
      this.location.id = (this.location.id % 3) + 1;
    }
    this.sensorService.getSensorData(this.location.id + '' + this.sensor.id).subscribe( sensorData => {
      this.readData = sensorData.data;
      if (this.readData.length > 0) {
        this.prepare();
        this.draw();
      }
    });
  }

  prepare() {
    this.preparedData = [];
    for (let i = 0; i < this.readData.length; i++) {
      this.preparedData.push(this.readData[i].x);
    }
  }

  draw() {
    // xscale
    this.xScale = d3.scaleOrdinal()
      .domain([d3.min(this.preparedData), d3.max(this.preparedData)])
      .range(xRange);
    // create bins for histogram
    const histogram = d3.histogram()
      .domain(this.xScale.domain());
    const bins = histogram(this.preparedData);

    // y Scale
    this.maxData = d3.max(bins, (d) => d.length);
    const yMargin =  margin.bottom;
    this.yScale = d3.scaleLinear().domain([0, this.maxData]).range([0, height -  yMargin -  yMargin]);

    // bar color scale
    const colorScale = d3.scaleLinear().domain([0, this.maxData]).range([255, 80]);

    // draw Bars
    const barChartWidth = (width - margin.left - margin.right);
    this.svgContainer.selectAll('rect').data(bins).enter()
      .append('rect')
      .attr('x', (d, i) => (i * (barChartWidth) / bins.length) + margin.left)
      .attr('y', (d) => height -  yMargin - this.yScale(d.length))
      .attr('width', (barChartWidth) / bins.length - this.barPadding)
      .attr('height', (d) => (this.yScale(d.length)))
      .attr('fill', (d) => 'rgb(10, ' + colorScale(d.length) + ',' + colorScale(d.length) + ')');

    // x Axis
    const xAxisScale = d3.scaleLinear()
      .domain([d3.min(bins, (d) => d.x0), d3.max(bins, (d) => d.x1)])
      .range(xRange);
    const xAxis = d3.axisBottom(xAxisScale).ticks(bins.length);
    this.svgContainer.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(' + 0 + ',' + (height - yMargin) + ')')
      .call(xAxis);
    this.svgContainer.append('text').attr('class', 'axis')
      .attr('transform',
        'translate(' + (width / 2) + ' ,' +
        (height - margin.bottom + margin.top) + ')')
      .style('text-anchor', 'middle')
      .text( this.sensor.name +
        ' ');

    // y Axis
    const yAxisScale = d3.scaleLinear().domain([0, this.maxData]).range([height - yMargin, yMargin]);
    const yAxis = d3.axisLeft(yAxisScale);
    this.svgContainer.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(' + margin.left  + ', ' + 0 + ')')
      .call(yAxis);

    // Add mouse position tooltip
    this.chartService.addMouseCursorTracker(this.svgContainer, xAxisScale, false,  yAxisScale, true);
  }

}
