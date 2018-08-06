import {Component, Input, OnChanges, OnInit} from '@angular/core';
import * as d3 from 'd3';
import {Sensor} from '../models/sensor';
import {rygColors, sensorColors} from '../models/colors';
import {margin} from '../common/svg-dimensions';

@Component({
  selector: 'app-scale-legend',
  templateUrl: './scale-legend.component.html',
  styleUrls: ['./scale-legend.component.css']
})
export class ScaleLegendComponent implements OnInit, OnChanges {

  svgContainer;
  numberOfRects = 50;
  rects = [];
  rectHeight;
  height;
  rectColor;

  @Input() sensor: Sensor;
  @Input() color: boolean;
  @Input() min: number;
  @Input() max: number;

  constructor() { }

  ngOnInit() {
    this.height = 500;

    this.rectHeight = this.height / this.numberOfRects;
    this.rectColor = d3.scaleQuantize()
      .domain([0, 100])
      .range(rygColors);
  }

  ngOnChanges() {
    this.height = 500;
    this.rects = [];
    this.rectHeight = this.height / this.numberOfRects;
    this.rectColor = d3.scaleQuantize()
      .domain([0, 100])
      .range(rygColors);
    for (let i = 0; i < this.numberOfRects; i++) {
      this.rects.push(100 - ((100 / this.numberOfRects) * i));
    }
    if ( this.svgContainer) {
      this.svgContainer.remove();
    }
    this.svgContainer = d3.select('#legend').append('svg').attr('width', 100)
      .attr('height', this.height + 150);

    this.svgContainer.selectAll('rect').data(this.rects).enter()
      .append('rect')
      .attr('x', 10)
      .attr('y', (d, i) => (50 + (this.rectHeight * i)))
      .attr('width', 40)
      .attr('height', this.rectHeight)
      .attr('fill', (d) => {
        if (this.color) {
          return this.rectColor(d);
        } else if (this.sensor) {
          const sensorColorFilter = sensorColors.filter((sC) => sC.type === this.sensor.id);
          return sensorColorFilter[0].color;
        }
      })
      .attr('fill-opacity', (d, i) => {
        if (this.color) {
          return 0.9;
        } else {
          return (0.8 / this.numberOfRects) * (this.numberOfRects - i);
        }
      });

    const axisScale = d3.scaleLinear().domain([this.min, this.max]).range([this.height + 50, 50]);
    // Add grid
    this.svgContainer.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(' + 50  + ', ' + 0 + ')')
      .call(d3.axisRight(axisScale));

    // text label for the y axis
    this.svgContainer.append('text').attr('class', 'axis')
      .attr('transform',
        'translate(' + (margin.left - 5) + ' ,' +
        (margin.top + 15) + ')')
      .style('text-anchor', 'middle')
      .text(this.sensor.unit);
  }

}
