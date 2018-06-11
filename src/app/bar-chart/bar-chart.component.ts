import { Component, OnInit, Input } from '@angular/core';
import * as d3 from 'd3';
import {Sensor} from '../models/sensor';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.css']
})
export class BarChartComponent implements OnInit {

  // set the dimensions and margins of the graph
  margin = {top: 20, right: 20, bottom: 50, left: 70};
  width = 960 - this.margin.left - this.margin.right;
  height = 500 - this.margin.top - this.margin.bottom;
  barPadding = 1;
  readData;
  preparedData;
  svgContainer;

  @Input() sensor: Sensor;
  constructor() { }

  ngOnInit() {
    this.svgContainer = d3.select('#barChart').append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom).style('border', '1px solid black')
      .append('g')
      .attr('transform',
        'translate(' + this.margin.left + ',' + this.margin.top + ')');

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
    // const chartWidth = this.width - this.containerPadding;
    // const chartHeight = this.height - this.bottomPadding - this.bottomAxisPadding;

    // create bins
    const xScale = d3.scaleOrdinal()
      .domain([d3.min(this.preparedData), d3.max(this.preparedData)])
      .range([0, this.width]);
    const histogram = d3.histogram()
      .domain(xScale.domain());
    const bins = histogram(this.preparedData);

    // y Scale
    const maxData = d3.max(bins, (d) => d.length);
    const yScale = d3.scaleLinear().domain([0, maxData]).range([0, this.height]);

    // draw Bars
    this.svgContainer.selectAll('rect').data(bins).enter()
      .append('rect')
      .attr('x', (d, i) => i * this.width / bins.length)
      .attr('y', (d) => this.height - yScale(d.length))
      .attr('width', this.width / bins.length - this.barPadding)
      .attr('height', (d) => yScale(d.length))
      .attr('fill', (d) => 'rgb(20, ' + (255 - (d.length)) + ',' + (255 - (d.length)) + ')');

    // x Axis
    const xAxisScale = d3.scaleLinear()
      .domain([d3.min(bins, (d) => d.x0), d3.max(bins, (d) => d.x1)])
      .range([0, this.width]);
    const xAxis = d3.axisBottom(xAxisScale).ticks(bins.length);
    this.svgContainer.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(' + 0 + ',' + (this.height) + ')')
      .call(xAxis);
    this.svgContainer.append('text')
      .attr('transform',
        'translate(' + (this.width / 2) + ' ,' +
        (this.height + this.margin.top + 20) + ')')
      .style('text-anchor', 'middle')
      .text('Heights');

    // y Axis
    const yAxisScale = d3.scaleLinear().domain([0, maxData]).range([this.height, 0]);
    const yAxis = d3.axisLeft(yAxisScale);
    this.svgContainer.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(' + 0  + ', ' + 0 + ')')
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
