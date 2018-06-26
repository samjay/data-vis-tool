import { Component, OnInit, Input } from '@angular/core';
import * as d3 from 'd3';
import {Sensor} from '../models/sensor';
import {height, margin, width} from '../common/svg-dimensions';
import {xRange, yRange} from '../common/range';
import {DataFileService} from '../data-file.service';
import {DateFilterService} from '../date-filter.service';
import {ChartService} from '../chart.service';
import {parseDate, parseDateSource} from '../common/dateFormats';

@Component({
  selector: 'app-scatter-plot',
  templateUrl: './scatter-plot.component.html',
  styleUrls: ['./scatter-plot.component.css']
})
export class ScatterPlotComponent implements OnInit {
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

  constructor(private dataService: DataFileService,
              private dateFilterService: DateFilterService,
              private chartService: ChartService) { }

  @Input() sensor: Sensor;

  ngOnInit() {
    this.svgContainer = d3.select('#scatterPlot').append('svg').attr('width', width)
      .attr('height', height).style('border', '1px solid black');
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
      this.preparedData.push({'x': d.SO4_CONC, 'y': d.NO3_CONC, 'date': parseDateSource(d.DATEOFF)});
    });
    this.dateFilterService.lowerDate = this.preparedData[0].date;
    this.dateFilterService.upperDate = this.preparedData[this.preparedData.length - 1].date;
    this.prepared = true;
  }

  filter() {
    // will show data within week of selected date
    const daysAfter7 = new Date();
    if (!this.selectedDate) {
      this.selectedDate = this.preparedData[0].date;
    }
    daysAfter7.setTime(this.selectedDate.getTime() + (7 * 24 * 60 * 60 * 1000));
    this.filteredData = this.preparedData.filter((d) =>
      d.date >= this.selectedDate && d.date <= daysAfter7);
  }

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
      .text('Heights');
    this.svgContainer.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(' + margin.left  + ', 0)')
      .call(yAxis);

    this.chartService.addMouseCursorTracker(this.svgContainer, this.xAxisScale, true, this.yAxisScale, true);
  }

  onDateRangeChange(dateRange: any) {
    this.selectedDate = parseDate(dateRange.from);
    this.filter();
    this.draw();
  }

}
