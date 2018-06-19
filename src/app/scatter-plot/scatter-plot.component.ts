import { Component, OnInit, Input } from '@angular/core';
import * as d3 from 'd3';
import {Sensor} from '../models/sensor';
import {height, margin, width} from '../common/svg-dimensions';
import {xRange, yRange} from '../common/range';

@Component({
  selector: 'app-scatter-plot',
  templateUrl: './scatter-plot.component.html',
  styleUrls: ['./scatter-plot.component.css']
})
export class ScatterPlotComponent implements OnInit {
  dataset = [];
  svgContainer;
  yScale;
  xScale;
  yMax;
  xMax;

  constructor() { }

  @Input() sensor: Sensor;

  ngOnInit() {
    this.svgContainer = d3.select('#scatterPlot').append('svg').attr('width', width)
      .attr('height', height).style('border', '1px solid black');
    this.randomize();
    this.draw();
  }

  draw() {
    this.svgContainer.remove();
    this.svgContainer = d3.select('#scatterPlot').append('svg').attr('width', width)
      .attr('height', height).style('border', '1px solid black');

    this.yMax = d3.max(this.dataset, (d) => d[1]);
    this.xScale = d3.scaleLinear()
      .domain([0, d3.max(this.dataset, (d) => d[0])])
      .range(xRange);
    this.yScale = d3.scaleLinear()
      .domain([0, this.yMax])
      .range(yRange);
    const rScale = d3.scaleLinear().domain([0, d3.max(this.dataset, (d) => d[1])]).range([2, 5]);
    const xAxis = d3.axisBottom(this.xScale).ticks(5);
    const yAxis = d3.axisLeft(this.yScale);

    // circles
    this.svgContainer.append('g').selectAll('circle').data(this.dataset).enter().append('circle')
      .attr('cx', (d) => this.xScale(d[0]))
      .attr('cy', (d) => this.yScale(d[1]))
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
      .attr('transform', 'translate(0,' + (height - margin.bottom) + ')')
      .call(xAxis);
    this.svgContainer.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(' + margin.left  + ', 0)')
      .call(yAxis);

    this.svgContainer.on('mousemove', (d, i, elem) =>  this.mouseTooltip(elem));

  }

  randomizeAndDraw() {
    this.randomize();
    this.draw();
  }

  randomize() {
    this.dataset = [];
    const numDataPoints = 50;
    const xValRange = Math.random() * 1000;
    const yValRange = Math.random() * 1000;
    for (let i = 0; i < numDataPoints; i++) {
      const newNum1 = Math.round(Math.random() * xValRange);
      const newNum2 = Math.round(Math.random() * yValRange);
      this.dataset.push([newNum1, newNum2]);
    }
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
        .text('x:' + Math.round(xVal) + ' y:' + Math.round(yVal));
      this.svgContainer.append('line').attr('id', 'lnHMouse').attr('x1', margin.left).attr('y1', coordinates[1])
        .attr('x2', width).attr('y2', coordinates[1]).style('stroke', 'green').style('opacity', 0.5);
      this.svgContainer.append('line').attr('id', 'lnVMouse').attr('x1', coordinates[0]).attr('y1', margin.bottom)
        .attr('x2', coordinates[0]).attr('y2', height - margin.bottom).style('stroke', 'green').style('opacity', 0.5);
    }
  }

}
