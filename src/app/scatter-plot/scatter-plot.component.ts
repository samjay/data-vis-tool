import { Component, OnInit, Input } from '@angular/core';
import * as d3 from 'd3';
import {Sensor} from '../models/sensor';
import {height, margin, width} from '../common/svg-dimensions';
import {xRange, yRange} from '../common/range';
import {DataFileService} from '../data-file.service';
import {DateFilterService} from '../date-filter.service';

@Component({
  selector: 'app-scatter-plot',
  templateUrl: './scatter-plot.component.html',
  styleUrls: ['./scatter-plot.component.css']
})
export class ScatterPlotComponent implements OnInit {
  readData;
  preparedData;
  svgContainer;
  yScale;
  xScale;
  xAxisScale;
  yAxisScale;
  yMax;
  prepared;
  parseDate;
  selectedDate;

  constructor(private dataService: DataFileService, private dateFilterService: DateFilterService) { }

  @Input() sensor: Sensor;

  ngOnInit() {
    this.svgContainer = d3.select('#scatterPlot').append('svg').attr('width', width)
      .attr('height', height).style('border', '1px solid black');
    this.getData();
  }

  getData() {
    this.parseDate = d3.timeParse('%m/%d/%Y %H:%M:%S');
    this.dataService.getReadData().subscribe( dataFromService => {
      this.readData = dataFromService;
      if (this.readData.length > 0) {
        this.prepare();
        this.draw();
      }
    });
  }

  prepare() {
    this.preparedData = [];
    this.readData.forEach((d) => {
      this.preparedData.push({'x': d.SO4_CONC, 'y': d.NO3_CONC, 'date': this.parseDate(d.DATEOFF)});
    });
    this.dateFilterService.lowerDate = this.preparedData[0].date;
    this.dateFilterService.upperDate = this.preparedData[this.preparedData.length - 1].date;
    this.prepared = true;
  }

  draw() {
    const daysAfter7 = new Date();
    if (!this.selectedDate) {
      this.selectedDate = this.preparedData[0].date;
    }
    daysAfter7.setTime(this.selectedDate.getTime() + (7 * 24 * 60 * 60 * 1000));
    const weekData = this.preparedData.filter((d) =>
         d.date >= this.selectedDate && d.date <= daysAfter7);
    this.svgContainer.remove();
    this.svgContainer = d3.select('#scatterPlot').append('svg').attr('width', width)
      .attr('height', height).style('border', '1px solid black');

    this.yMax = d3.max(weekData, (d) => d.y);
    this.xScale = d3.scaleLinear()
      .domain([0, d3.max(weekData, (d) => d.x)])
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
    this.svgContainer.append('g').selectAll('circle').data(weekData).enter().append('circle')
      .attr('cx', (d) => this.xScale(d.x))
      .attr('cy', (d) => this.yScale(d.y))
      .attr('r', 5).attr('fill-opacity', 0.6).attr('fill', 'blue');

    // Add Axis
    this.svgContainer.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(0,' + (height - margin.bottom) + ')')
      .call(xAxis).append('text')
      .attr('x', width)
      .attr('y', margin.bottom - 10)
      .style('text-anchor', 'end')
      .text('NO3 Concenration');
    this.svgContainer.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(' + margin.left  + ', 0)')
      .call(yAxis);

    this.svgContainer.on('mousemove', (d, i, elem) =>  this.mouseTooltip(elem));
  }

  mouseTooltip(elem) {
    d3.select('#txMouse').remove();
    d3.select('#lnHMouse').remove();
    d3.select('#lnVMouse').remove();
    const coordinates = d3.mouse(elem[0]);
    const yVal = this.yScale.invert(coordinates[1] - 1);
    const xVal = this.xScale.invert(coordinates[0]);
    if (yVal > 0 && yVal < this.yMax && coordinates[0] > margin.left && coordinates[0] < width - 20) {
      this.svgContainer.append('text').attr('class', 'mouseTooltip').attr('id', 'txMouse')
        .attr('x', coordinates[0] + 3).attr('y', coordinates[1] - 3)
        .text('x:' + Math.round(xVal * 100) / 100 + ' y:' + Math.round(yVal * 100) / 100);
      this.svgContainer.append('line').attr('id', 'lnHMouse').attr('x1', margin.left).attr('y1', coordinates[1])
        .attr('x2', width).attr('y2', coordinates[1]).style('stroke', 'green').style('opacity', 0.5);
      this.svgContainer.append('line').attr('id', 'lnVMouse').attr('x1', coordinates[0]).attr('y1', margin.bottom)
        .attr('x2', coordinates[0]).attr('y2', height - margin.bottom).style('stroke', 'green').style('opacity', 0.5);
    }
  }

  onDateRangeChange(dateRange: any) {
    this.parseDate = d3.timeParse('%m/%d/%Y');
    this.selectedDate = this.parseDate(dateRange.from);
    this.draw();
  }

}
