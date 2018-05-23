import { Component, OnInit, Input } from '@angular/core';
import * as d3 from 'd3';
import {Sensor} from '../models/sensor';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.css']
})
export class BarChartComponent implements OnInit {

  dataset = [ 5, 10, 13, 19, 21, 25, 22, 18, 15, 13,
    11, 12, 15, 20, 18, 17, 16, 18, 23, 25 ];
  w = 500;
  h = 150;
  barPadding = 1;
  parseDate;

  @Input() sensor: Sensor;
  constructor() { }

  ngOnInit() {
    const maxData = d3.max(this.dataset, (d) => d);
    const yAxisScale = d3.scaleLinear().domain([0, maxData]).range([0, this.h - 10]);
    const svgContainer = d3.select('svg').attr('width', this.w)
      .attr('height', this.h).style('border', '1px solid black');
    // Bars
    svgContainer.selectAll('rect').data(this.dataset).enter()
      .append('rect')
      .attr('x', (d, i) => i * this.w / this.dataset.length)
      .attr('y', (d) => this.h - yAxisScale(d) - 5)
      .attr('width', this.w / this.dataset.length - this.barPadding)
      .attr('height', (d) => yAxisScale(d))
      .attr('fill', (d) => 'rgb(20, ' + (255 - (d * 5)) + ',' + (255 - (d * 10)) + ')');

    // Bar labels
    svgContainer.selectAll('text').data(this.dataset).enter()
      .append('text')
      .text((d) => d)
      .attr('x', (d, i) => i * (this.w / this.dataset.length) + 6)
      .attr('y', (d) => this.h - yAxisScale(d) + 14)
      .attr('font-family', 'sans-serif')
      .attr('font-size', '11px')
      .attr('fill', 'white');
  }

}
