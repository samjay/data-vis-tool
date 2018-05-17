import { Component, OnInit, Input } from '@angular/core';
import * as d3 from 'd3';
import {Sensor} from '../models/sensor';

@Component({
  selector: 'app-scatter-plot',
  templateUrl: './scatter-plot.component.html',
  styleUrls: ['./scatter-plot.component.css']
})
export class ScatterPlotComponent implements OnInit {
  dataset = [];
  w = 620;
  h = 400;
  padding = 30;
  svgContainer;

  constructor() { }

  @Input() sensor: Sensor;

  ngOnInit() {
    this.svgContainer = d3.select('#chart').append('svg').attr('width', this.w)
      .attr('height', this.h).style('border', '1px solid black');
    this.randomize();
    this.draw();
  }

  draw() {
    this.svgContainer.remove();
    this.svgContainer = d3.select('#chart').append('svg').attr('width', this.w)
      .attr('height', this.h).style('border', '1px solid black');
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(this.dataset, (d) => d[0])])
      .range([this.padding, this.w - this.padding * 2]);
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(this.dataset, (d) => d[1])])
      .range([this.h - this.padding, this.padding]);
    const rScale = d3.scaleLinear().domain([0, d3.max(this.dataset, (d) => d[1])]).range([2, 5]);
    const xAxis = d3.axisBottom(xScale).ticks(5);
    const yAxis = d3.axisLeft(yScale);

    // circles
    this.svgContainer.append('g').selectAll('circle').data(this.dataset).enter().append('circle')
      .attr('cx', (d) => xScale(d[0]))
      .attr('cy', (d) => yScale(d[1]))
      .attr('r', (d) => rScale(d[1]));

    // Text labels for points
    // svgContainer.selectAll('text').data(this.dataset).enter().append('text')
    //   .text((d) => '(' + d[0] + ', ' + d[1] + ')')
    //   .attr('x', (d) => xScale(d[0]))
    //   .attr('y', (d) => yScale(d[1]))
    //   .attr('font-family', 'sans-serif')
    //   .attr('font-size', '11px')
    //   .attr('fill', 'red');

    // Add Axis
    this.svgContainer.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(0,' + (this.h - this.padding) + ')')
      .call(xAxis);
    this.svgContainer.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(' + this.padding  + ', 0)')
      .call(yAxis);

  }

  randomizeAndDraw(){
    this.randomize();
    this.draw();
  }

  randomize() {
    this.dataset = [];
    const numDataPoints = 50;
    const xRange = Math.random() * 1000;
    const yRange = Math.random() * 1000;
    for (let i = 0; i < numDataPoints; i++) {
      const newNum1 = Math.round(Math.random() * xRange);
      const newNum2 = Math.round(Math.random() * yRange);
      this.dataset.push([newNum1, newNum2]);
    }
  }

}