import { Component, OnInit, Input } from '@angular/core';
import {Sensor} from '../models/sensor';
import * as d3 from 'd3';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit {
  lineData = [ { 'x': 1,   'y': 5},  { 'x': 20,  'y': 20},
             { 'x': 40,  'y': 10}, { 'x': 60,  'y': 40},
              { 'x': 80,  'y': 5},  { 'x': 100, 'y': 60}];

  w = 620;
  h = 400;
  padding = 30;
  svgContainer;
  lineFunction;

  constructor() { }

  @Input() sensor: Sensor;

  ngOnInit() {
    this.svgContainer = d3.select('#chart').append('svg').attr('width',  this.w)
      .attr('height', this.h).style('border', '1px solid black');
    this.randomize();
   // this.setMaxBoundaries();
    this.draw();
  }

  draw() {
    this.svgContainer.remove();
    this.svgContainer = d3.select('#chart').append('svg').attr('width', this.w)
      .attr('height', this.h).style('border', '1px solid black');
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(this.lineData, (d) => d.x)])
      .range([this.padding, this.w - this.padding * 2]);
    const xAxis = d3.axisBottom(xScale);
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(this.lineData, (d) => d.y)])
      .range([this.h - this.padding, this.padding]);
    const yAxis = d3.axisLeft(yScale);

    // Add Axis
    this.svgContainer.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(0,' + (this.h - this.padding) + ')')
      .call(xAxis);
    this.svgContainer.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(' + this.padding  + ', 0)')
      .call(yAxis);

    // Draw Line
    this.lineFunction = d3.line().x(d => xScale(d.x)).y(d => yScale(d.y)).curve(d3.curveLinear);
    this.svgContainer.append('path').attr('d', this.lineFunction(this.lineData)).attr('stroke', 'blue')
      .attr('stroke-width', 2).attr('fill', 'none');
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

  randomize() {
    this.lineData = [];
    const numDataPoints = 20;
    const xRange = Math.random() * 1000;
    const yRange = Math.random() * 1000;
    for (let i = 0; i < numDataPoints; i++) {
      const newNum1 = Math.round(Math.random() * xRange);
      const newNum2 = Math.round(Math.random() * yRange);
      this.lineData.push({'x': newNum1, 'y': newNum2});
    }
    this.lineData.sort((x, y) => d3.ascending(x.x, y.x));
  }

  randomizeAndDraw() {
    this.randomize();
    // this.setMaxBoundaries();
    this.draw();
  }
}
