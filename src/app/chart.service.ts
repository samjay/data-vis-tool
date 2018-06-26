import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import {height, margin, width} from './common/svg-dimensions';

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  constructor() { }

  addMouseCursorTracker(svg, xScale, showX, yScale, showY) {
    svg.on('mousemove', (d, i, elem) => {
      d3.select('#txHMouse').remove();
      d3.select('#txVMouse').remove();
      d3.select('#lnHMouse').remove();
      d3.select('#lnVMouse').remove();
      const coordinates = d3.mouse(elem[0]);
      const yVal = yScale.invert(coordinates[1]);
      const xVal = xScale.invert(coordinates[0]);
      if (coordinates[1] > margin.bottom && coordinates[1] < height - margin.bottom
        && coordinates[0] > margin.left && coordinates[0] < width - margin.left) {
        // horizontal line
        svg.append('line').attr('id', 'lnHMouse').attr('x1', margin.left).attr('y1', coordinates[1])
          .attr('x2', width - margin.right).attr('y2', coordinates[1]).style('stroke', 'green').style('opacity', 0.8);
        if (showY) {
        svg.append('text').attr('class', 'mouseTooltip').attr('id', 'txHMouse').attr('class', 'mouseTooltip')
          .attr('x', width - margin.right - 10).attr('y', coordinates[1] - 3)
          .text(Math.round(yVal * 100) / 100);
        }
        // vertical line
        svg.append('line').attr('id', 'lnVMouse').attr('x1', coordinates[0]).attr('y1', margin.bottom)
          .attr('x2', coordinates[0]).attr('y2', height - margin.bottom).style('stroke', 'green').style('opacity', 0.8);
        if (showX) {
          svg.append('text').attr('class', 'mouseTooltip').attr('id', 'txVMouse').attr('class', 'mouseTooltip')
            .attr('x', coordinates[0]).attr('y', margin.bottom)
            .text(Math.round(xVal * 100) / 100);
        }
      }});
  }
}
