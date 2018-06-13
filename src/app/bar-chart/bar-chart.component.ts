import { Component, OnInit, Input } from '@angular/core';
import * as d3 from 'd3';
import {Sensor} from '../models/sensor';
import {height, margin, width} from '../common/svg-dimensions';
import {xRange} from '../common/range';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.css']
})
export class BarChartComponent implements OnInit {

  barPadding = 1;
  readData;
  preparedData;
  svgContainer;
  yScale;
  maxData;

  @Input() sensor: Sensor;
  constructor() { }

  ngOnInit() {
    this.svgContainer = d3.select('#barChart').append('svg').attr('width', width)
      .attr('height', height).style('border', '1px solid black');

    // Add mouse position tooltip
    this.svgContainer.on('mousemove', (d, i, elem) =>  this.mouseTooltip(d, i, elem));

    d3.csv('assets/baseball_data.csv').then((data) => {
      this.readData = data;
      this.prepare();
      this.draw();
    });
  }

  prepare() {
    this.preparedData = [];
    for (let i = 0; i < this.readData.length; i++) {
      this.preparedData.push(this.readData[i].height);
    }
  }

  draw() {
    // create bins
    const xScale = d3.scaleOrdinal()
      .domain([d3.min(this.preparedData), d3.max(this.preparedData)])
      .range(xRange);
    const histogram = d3.histogram()
      .domain(xScale.domain());
    const bins = histogram(this.preparedData);
    console.log(bins);

    // y Scale
    this.maxData = d3.max(bins, (d) => d.length);
    const yMargin =  margin.bottom;
    const yAxisScale = d3.scaleLinear().domain([0, this.maxData]).range([height - yMargin, yMargin]);
    this.yScale = d3.scaleLinear().domain([0, this.maxData]).range([0, height -  yMargin -  yMargin]);

    // draw Bars
    const barWidth = (width - margin.left - margin.right);
    this.svgContainer.selectAll('rect').data(bins).enter()
      .append('rect')
      .attr('x', (d, i) => (i * (barWidth) / bins.length) + margin.left)
      .attr('y', (d) => height -  yMargin - this.yScale(d.length))
      .attr('width', (barWidth) / bins.length - this.barPadding)
      .attr('height', (d) => (this.yScale(d.length)))
      .attr('fill', (d) => 'rgb(20, ' + (255 - (d.length)) + ',' + (255 - (d.length)) + ')');

    // Add grid
    this.svgContainer.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(yAxisScale)
        .tickSize(- width, 0, 0)
        .tickFormat('')
      );

    // x Axis
    const xAxisScale = d3.scaleLinear()
      .domain([d3.min(bins, (d) => d.x0), d3.max(bins, (d) => d.x1)])
      .range(xRange);
    const xAxis = d3.axisBottom(xAxisScale).ticks(bins.length);
    this.svgContainer.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(' + 0 + ',' + (height - yMargin) + ')')
      .call(xAxis);
    this.svgContainer.append('text')
      .attr('transform',
        'translate(' + (width / 2) + ' ,' +
        (height - yMargin + 30) + ')')
      .style('text-anchor', 'middle')
      .text('Heights');

    // y Axis
    const yAxis = d3.axisLeft(yAxisScale);
    this.svgContainer.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(' + margin.left  + ', ' + 0 + ')')
      .call(yAxis);
  }
    // // Bar labels
    // this.svgContainer.selectAll('text').data(this.dataset).enter()
    //   .append('text')
    //   .text((d) => d)
    //   .attr('x', (d, i) => i * (this.width / this.dataset.length) + 6)
    //   .attr('y', (d) => this.height - yAxisScale(d) + 14)
    //   .attr('font-family', 'sans-serif')
    //   .attr('font-size', '11px')
    //   .attr('fill', 'white');
  // }

  mouseTooltip(d, i, elem) {
    d3.select('#txMouse').remove();
    d3.select('#lnHMouse').remove();
    d3.select('#lnVMouse').remove();
    const coordinates = d3.mouse(elem[0]);
    const yVal = this.yScale.invert(height - margin.bottom - coordinates[1]);
    if (yVal > 0 && yVal < this.maxData) {
      this.svgContainer.append('text').attr('id', 'txMouse').attr('x', coordinates[0] + 3).attr('y', coordinates[1] - 3)
      .text(Math.round(this.yScale.invert(height - margin.bottom - coordinates[1])));
      this.svgContainer.append('line').attr('id', 'lnHMouse').attr('x1', margin.left).attr('y1', coordinates[1])
        .attr('x2', width).attr('y2', coordinates[1]).style('stroke', 'black').style('opacity', 0.5);
      this.svgContainer.append('line').attr('id', 'lnVMouse').attr('x1', coordinates[0]).attr('y1', margin.bottom)
        .attr('x2', coordinates[0]).attr('y2', height - margin.bottom).style('stroke', 'black').style('opacity', 0.5);
    }
  }
}
