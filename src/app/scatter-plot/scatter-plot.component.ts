import { Component, OnInit, Input } from '@angular/core';
import * as d3 from 'd3';
import {Sensor} from '../models/sensor';

@Component({
  selector: 'app-scatter-plot',
  templateUrl: './scatter-plot.component.html',
  styleUrls: ['./scatter-plot.component.css']
})
export class ScatterPlotComponent implements OnInit {
  dataset = [
    [5, 20], [480, 90], [250, 50], [100, 33], [330, 95],
    [410, 12], [475, 44], [25, 67], [85, 21], [220, 88]
  ];
  w = 520;
  h = 150;
  constructor() { }

  @Input() sensor: Sensor;

  ngOnInit() {
    const svgContainer = d3.select('svg').attr('width', this.w)
      .attr('height', this.h).style('border', '1px solid black');

    // circles
    svgContainer.selectAll('circle').data(this.dataset).enter().append('circle')
      .attr('cx', (d) => d[0])
      .attr('cy', (d) => d[1])
      .attr('r', (d) =>  Math.sqrt(this.h - d[1]) / 2);

    svgContainer.selectAll('text').data(this.dataset).enter().append('text')
      .text((d) => '(' + d[0] + ', ' + d[1] + ')')
      .attr('x', (d) => d[0])
      .attr('y', (d) => d[1])
      .attr('font-family', 'sans-serif')
      .attr('font-size', '11px')
      .attr('fill', 'red');
  }

}
