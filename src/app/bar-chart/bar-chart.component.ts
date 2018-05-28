import { Component, OnInit, Input } from '@angular/core';
import * as d3 from 'd3';
import {Sensor} from '../models/sensor';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.css']
})
export class BarChartComponent implements OnInit {

  w = 700;
  h = 350;
  barPadding = 1;
  svgContainer;

  @Input() sensor: Sensor;
  constructor() { }

  ngOnInit() {
    d3.csv('assets/baseball_data.csv').then((data) => {
      this.updateWithCSV(data);
    });
    this.svgContainer = d3.select('#chart').append('svg').attr('width', this.w)
      .attr('height', this.h).style('border', '1px solid black');
  }

  updateWithCSV(data: any) {
    this.svgContainer.remove();
    const heights = [];
    for (let i = 0; i < data.length; i++) {
      heights.push(data[i].height);
    }
    const xScale = d3.scaleOrdinal().domain([d3.min(heights), d3.max(heights)]).range([0, this.w]);
    const histogram = d3.histogram()
      .domain(xScale.domain());
    const bins = histogram(heights);

    const maxData = d3.max(bins, (d) => d.length);
    console.log(bins);
    const yAxisScale = d3.scaleLinear().domain([0, maxData]).range([0, this.h - 10]);
    this.svgContainer = d3.select('#chart').append('svg').attr('width', this.w)
      .attr('height', this.h).style('border', '1px solid black');
    // Bars
    this.svgContainer.selectAll('rect').data(bins).enter()
      .append('rect')
      .attr('x', (d, i) => i * this.w / bins.length)
      .attr('y', (d) => this.h - yAxisScale(d.length) - 20)
      .attr('width', this.w / bins.length - this.barPadding)
      .attr('height', (d) => yAxisScale(d.length))
      .attr('fill', (d) => 'rgb(20, ' + (255 - (d.length)) + ',' + (255 - (d.length)) + ')');
    // add the x Axis
    const xAxisScale = d3.scaleLinear()
      .domain([d3.min(bins, (d) => d.x0), d3.max(bins, (d) => d.x1)])
      .range([0, this.w]);
    const xAxis = d3.axisBottom(xAxisScale).ticks(18);
    this.svgContainer.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(0,' + (this.h - 18) + ')')
      .call(xAxis);

    // // Bar labels
    // this.svgContainer.selectAll('text').data(this.dataset).enter()
    //   .append('text')
    //   .text((d) => d)
    //   .attr('x', (d, i) => i * (this.w / this.dataset.length) + 6)
    //   .attr('y', (d) => this.h - yAxisScale(d) + 14)
    //   .attr('font-family', 'sans-serif')
    //   .attr('font-size', '11px')
    //   .attr('fill', 'white');
  }
}
