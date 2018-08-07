import {Component, Input, OnChanges, OnInit} from '@angular/core';
import * as d3 from 'd3';
import {Sensor} from '../models/sensor';
import {maxOpacity, rygColors, sensorColors} from '../models/colors';
import {axisLabelPadding, margin} from '../common/svg-dimensions';

@Component({
  selector: 'app-scale-legend',
  templateUrl: './scale-legend.component.html',
  styleUrls: ['./scale-legend.component.css']
})
export class ScaleLegendComponent implements OnInit, OnChanges {

  svgContainer;
  numberOfRects = 50; // granularity of the scale color gradient
  rects = [];
  rectHeight;
  rectWidth = 50;
  height = 500;
  heightMargin = 150;
  width = 100;
  rectColor;
  maxPercent = 100;
  marginLeft = 10;
  marginTop = 50;

  @Input() sensor: Sensor;
  @Input() color: boolean;
  @Input() min: number;
  @Input() max: number;

  constructor() { }

  ngOnInit() {
    this.rectHeight = this.height / this.numberOfRects;
    this.rectColor = d3.scaleQuantize().domain([0, 100]).range(rygColors);
  }

  ngOnChanges() {
    this.rects = [];
    this.rectHeight = this.height / this.numberOfRects;
    this.rectColor = d3.scaleQuantize().domain([0, 100]).range(rygColors);

    for (let i = 0; i < this.numberOfRects; i++) {
      this.rects.push(this.maxPercent - ((this.maxPercent / this.numberOfRects) * i));
    }
    if ( this.svgContainer) {
      this.svgContainer.remove();
    }
    this.svgContainer = d3.select('#legend').append('svg').attr('width', this.width)
      .attr('height', this.height + this.heightMargin);

    this.svgContainer.selectAll('rect').data(this.rects).enter()
      .append('rect')
      .attr('x', this.marginLeft)
      .attr('y', (d, i) => (this.marginTop + (this.rectHeight * i)))
      .attr('width', this.rectWidth)
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
          return maxOpacity;
        } else {
          return (maxOpacity / this.numberOfRects) * (this.numberOfRects - i);
        }
      });

    const axisScale = d3.scaleLinear().domain([this.min, this.max]).range([this.height + margin.bottom, margin.bottom]);
    // Add grid
    this.svgContainer.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(' + (margin.right)  + ', ' + 0 + ')')
      .call(d3.axisRight(axisScale));

    // text label for the y axis
    this.svgContainer.append('text').attr('class', 'axis')
      .attr('transform',
        'translate(' + (margin.right) + ' ,' +
        (margin.top + axisLabelPadding.top) + ')')
      .style('text-anchor', 'middle')
      .text(this.sensor.unit);
  }

}
