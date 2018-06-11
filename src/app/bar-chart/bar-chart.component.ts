import { Component, OnInit, Input } from '@angular/core';
import * as d3 from 'd3';
import {Sensor} from '../models/sensor';
import {height, margin, width} from '../common/svg-dimensions';
import {xRange, yRange} from '../common/range';

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

  @Input() sensor: Sensor;
  constructor() { }

  ngOnInit() {
    this.svgContainer = d3.select('#barChart').append('svg').attr('width', width)
      .attr('height', height).style('border', '1px solid black');

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

    // y Scale
    const maxData = d3.max(bins, (d) => d.length);
    const yScale = d3.scaleLinear().domain([0, maxData]).range(yRange);

    // draw Bars

    const barWidth = (width - margin.left - margin.right);
    this.svgContainer.selectAll('rect').data(bins).enter()
      .append('rect')
      .attr('x', (d, i) => (i * (barWidth) / bins.length) + margin.left)
      .attr('y', (d) => yScale(d.length) - margin.top)
      .attr('width', (barWidth) / bins.length - this.barPadding)
      .attr('height', (d) => height - yScale(d.length) - margin.top)
      .attr('fill', (d) => 'rgb(20, ' + (255 - (d.length)) + ',' + (255 - (d.length)) + ')');

    // x Axis
    const xAxisScale = d3.scaleLinear()
      .domain([d3.min(bins, (d) => d.x0), d3.max(bins, (d) => d.x1)])
      .range(xRange);
    const xAxis = d3.axisBottom(xAxisScale).ticks(bins.length);
    this.svgContainer.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(' + 0 + ',' + (height - margin.top - 20) + ')')
      .call(xAxis);
    this.svgContainer.append('text')
      .attr('transform',
        'translate(' + (width / 2) + ' ,' +
        (height + margin.top + 20) + ')')
      .style('text-anchor', 'middle')
      .text('Heights');

    // y Axis
    const yAxis = d3.axisLeft(yScale);
    this.svgContainer.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(' + margin.left  + ', ' + (margin.top - 10) + ')')
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
}
