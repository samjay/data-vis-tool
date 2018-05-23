import { Component, OnInit, Input } from '@angular/core';
import {Sensor} from '../models/sensor';
import * as d3 from 'd3';
import {parseDate} from 'ngx-bootstrap/chronos';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit {
  lineData = [ { 'date': '15-Jun-16',   'y': 5},  { 'date': '15-Jul-16',  'y': 20},
             { 'date': '15-Aug-16',  'y': 10}, { 'date': '15-Sep-16',  'y': 40},
              { 'date': '15-Oct-16',  'y': 5},  { 'date': '15-Nov-16', 'y': 60},
    { 'date': '15-Dec-16',   'y': 40},  { 'date': '15-Jan-17',  'y': 20},
    { 'date': '15-Feb-17',  'y': 10}, { 'date': '15-Mar-17',  'y': 40},
    { 'date': '15-Apr-17',  'y': 5},  { 'date': '15-May-17', 'y': 60}];

  preparedData = [];
  w = 620;
  h = 400;
  padding = 25;
  svgContainer;
  lineFunction;
  parseDate;

  constructor() { }

  @Input() sensor: Sensor;

  ngOnInit() {
    this.svgContainer = d3.select('#chart').append('svg').attr('width',  this.w)
      .attr('height', this.h).style('border', '1px solid black');
    this.prepare();
    // this.randomize();
   // this.setMaxBoundaries();
    this.draw();
  }

  prepare() {
    this.parseDate = d3.timeParse('%d-%b-%y');
    this.lineData.forEach((d) => {
      this.preparedData.push({'date': this.parseDate(d.date), 'y': d.y});
    });
  }

  draw() {
    this.svgContainer.remove();
    this.svgContainer = d3.select('#chart').append('svg').attr('width', this.w)
      .attr('height', this.h).style('border', '1px solid black');

    // x-axis

    // const xScale = d3.scaleLinear()
    //   .domain([0, d3.max(this.lineData, (d) => d.x)])
    //   .range([this.padding, this.w - this.padding * 2]);
    const xScale = d3.scaleTime()
      .domain(d3.extent(this.preparedData, (d) => d.date))
            .range([this.padding, this.w - this.padding * 2]);
    const xScale2 = d3.scalePoint()
      .domain(this.preparedData.map((d) => d.date))
      .range([this.padding, this.w - this.padding * 2]);
    const xAxis = d3.axisBottom(xScale2).tickFormat(d3.timeFormat('%b %d')).ticks(5).tickPadding(2);

    // y-axis
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(this.preparedData, (d) => d.y)])
      .range([this.h - this.padding, this.padding]);
    const yAxis = d3.axisLeft(yScale);

    // Add grid
    this.svgContainer.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(yScale)
        .tickSize(- this.w, 0, 0)
        .tickFormat('')
      );

    // Add Axis
    this.svgContainer.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + (this.h - this.padding) + ')')
      .call(xAxis);
    this.svgContainer.append('g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(' + this.padding + ', 0)')
      .call(yAxis);

    // Draw Line
    this.lineFunction = d3.line().x(d => xScale(d.date)).y(d => yScale(d.y)).curve(d3.curveBasis);
    this.svgContainer.append('path').attr('d', this.lineFunction(this.preparedData)).attr('stroke', 'blue')
      .attr('stroke-width', 4).attr('fill', 'none');
  }

  // setMaxBoundaries() {
  //   for (let i = 0; i < this.lineData.length; i++) {
  //     const tempx = this.lineData[i].x * 5;
  //     const tempy = this.lineData[i].y * 5;
  //
  //     if (tempx > this.max_x) {
  //       this.max_x = tempx;
  //     }
  //
  //     if (tempy > this.max_y) {
  //       this.max_y = tempy;
  //     }
  //   }
  // }

  // randomize() {
  //   this.lineData = [];
  //   const numDataPoints = 20;
  //   const xRange = Math.random() * 1000;
  //   const yRange = Math.random() * 1000;
  //   for (let i = 0; i < numDataPoints; i++) {
  //     const newNum1 = Math.round(Math.random() * xRange);
  //     const newNum2 = Math.round(Math.random() * yRange);
  //     this.lineData.push({'x': newNum1, 'y': newNum2});
  //   }
  //   this.lineData.sort((x, y) => d3.ascending(x.x, y.x));
  // }

  // randomizeAndDraw() {
  //   this.randomize();
  //   // this.setMaxBoundaries();
  //   this.draw();
  // }

  reduceDomain() {
    this.preparedData = this.preparedData
      .filter((d) =>
        d.date > this.parseDate('01-Sep-16') &&
        d.date < this.parseDate('20-Feb-17'));
    this.draw();
  }
}
