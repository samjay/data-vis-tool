import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import {TunnelNetwork} from '../models/tunnel-network';
import {Router} from '@angular/router';
import {SensorsService} from '../sensors.service';
import {text} from '@angular/core/src/render3/instructions';

@Component({
  selector: 'app-tunnel-network',
  templateUrl: './tunnel-network.component.html',
  styleUrls: ['./tunnel-network.component.css']
})
export class TunnelNetworkComponent implements OnInit {

  // svg dims
  margin = {top: 30, right: 30, bottom: 50, left: 70};
  width = 1000 - this.margin.left - this.margin.right;
  height = 700 - this.margin.top - this.margin.bottom;

  tunnelNet: TunnelNetwork;

  svgContainer;
  xScale;
  yScale;
  stopAnimation: boolean;

  constructor(private router: Router, private sensorService: SensorsService) { }

  ngOnInit() {
    this.svgContainer = d3.select('#tunnelNetChart').append('svg')
      .attr('width',  this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .style('border', '1px solid black');

    this.sensorService.getTunnerlNetwork().subscribe(tunnelNetwork => this.tunnelNet = tunnelNetwork);

    this.xScale = d3.scaleLinear()
      .domain([d3.min(this.tunnelNet.locations, (location) => location.x),
        d3.max(this.tunnelNet.locations, (location) => location.x)])
      .range([this.margin.left, this.width]);

    this.yScale = d3.scaleLinear()
      .domain([d3.min(this.tunnelNet.locations, (location) => location.y),
        d3.max(this.tunnelNet.locations, (location) => location.y)])
      .range([this.margin.top, this.height]);

    const lineFunction = d3.line().x(d => this.xScale(d.x)).y(d => this.yScale(d.y));

    this.svgContainer.selectAll('path').data(this.tunnelNet.tunnels).enter()
      .append('path').attr('d', (d) => lineFunction(d.locations))
      .attr('stroke', d3.rgb( Math.random() * 255, Math.random() * 255, Math.random() * 255 ))
      .attr('stroke-width', 7).attr('fill', 'none');

    this.stopAnimation = false;
    this.svgContainer.selectAll('circle').data(this.tunnelNet.locations).enter().each((d, i) => this.showWarning(d))
      .append('circle').attr('cx', (d) => this.xScale(d.x))
      .attr('cy', (d) => this.yScale(d.y))
      .attr('r', 15)
      .attr('fill', d3.rgb( Math.random() * 255, Math.random() * 255, Math.random() * 255 ))
      .on('mouseover', (d, i, elem) => this.showDetails(d, i, elem))
      .on('mouseout', (d, i, elem) => this.hideDetails(d, i, elem))
      .on('click', (d, i) => this.goToSensorLocation(d));
  }

  showDetails(d, i, elem) {
    const circle = d3.select(elem[i]);
    circle.transition()
      .duration(500)
      .attr('r', 23);

    this.svgContainer.append('rect').attr('id', 'r' + d.x + '-' + d.y + '-' + i)
      .attr('x', () => this.xScale(d.x) + 30)
      .attr('y', () => this.yScale(d.y) - 25)
      .attr('width', 1)
      .attr('height', 5).attr('fill', d3.rgb( 163, 187, 224))
      .transition().duration(500)
      .attr('width', 80).attr('height', 40);

    this.svgContainer.append('text').attr('id', 't1' + d.x + '-' + d.y + '-' + i)
      .attr('x', () => this.xScale(d.x) + 33)
      .attr('y', () => this.yScale(d.y) - 10).attr('font-size', 13).attr('fill-opacity', 0.1)
      .text('location: ' + d.id)
      .transition().delay(100).duration(500)
      .attr('fill-opacity', 1);
    this.svgContainer.append('text').attr('id', 't2' + d.x + '-' + d.y + '-' + i)
      .attr('x', () => this.xScale(d.x) + 33)
      .attr('y', () => this.yScale(d.y) + 6).attr('font-size', 13).attr('fill-opacity', 0.1)
      .attr('fill', () => {
        if (d.status_ok) {
          return 'green';
        } else {
          return 'red';
        }
      })
      .text(() => {
        if (d.status_ok) {
          return 'status OK';
        } else {
          return 'status WARN';
        }
      }).transition().delay(100).duration(500)
      .attr('fill-opacity', 1);

  }

  hideDetails(d, i, elem) {
    const circle = d3.select(elem[i]);
    circle.transition()
      .duration(100).attr('r', 15);
    d3.select('#t1' + d.x + '-' + d.y + '-' + i).remove();
    d3.select('#t2' + d.x + '-' + d.y + '-' + i).remove();
    d3.select('#r' + d.x + '-' + d.y + '-' + i).remove();
  }

  showWarning(d) {
    if (!d.status_ok) {
      this.pulse(d);
    }
  }

  pulse(d) {
      const circle = this.svgContainer.append('circle').attr('cx', () => this.xScale(d.x))
        .attr('cy', () => this.yScale(d.y))
        .attr('r', 1).style('fill', 'red').attr('fill-opacity', 0.8)
        .on('click', () => this.goToSensorLocation(d));
      repeat();
      function repeat() {
        circle
          .transition()
          .duration(1000)
          .attr('r', 30).style('fill', 'red')
          .attr('fill-opacity', 0.4)
          .transition()
          .duration(10)
          .attr('r', 1).attr('fill-opacity', 0.8)
          .on('end', repeat);
      }
  }

  goToSensorLocation(d) {
    this.router.navigate(['/location', d.id]);
  }

}
