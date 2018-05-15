import { Component, OnInit, Input, OnChanges } from '@angular/core';
import {Sensor} from '../models/sensor';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { SensorsService } from '../sensors.service';
import * as d3 from 'd3';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit {
  lineData = [ { 'x': 1,   'y': 5},  { 'x': 20,  'y': 20},
             { 'x': 40,  'y': 10}, { 'x': 60,  'y': 40},
              { 'x': 80,  'y': 5},  { 'x': 100, 'y': 60}];

  max_x = 0;
  max_y = 0;

  @Input() sensor: Sensor;

  constructor(
    private location: Location
  ) { }

  /*ngOnChanges() {
    const lineFunction = d3.line().x(d => d.x * 5).y(d => d.y * 5).curve(d3.curveLinear);

    this.setMaxBoundaries();

    const axisScale = d3.scaleLinear().domain([0, 100]).range([0, this.max_x]);
    const xAxis = d3.axisBottom(axisScale);
    // this.maxCount = d3.max(this.sales, (d, i) => d.count);
    // this.y = d3.scaleBand().rangeRound([0, 75])
    //   .domain(this.sales.map((d, i) => d.product));
    // this.x = d3.scaleLinear()
    //   .range([0, 300])
    //   .domain([0, this.maxCount]);
    // // .domain([
    // //   new Date(Date.parse('2014-01-01')),
    // //   new Date(Date.parse('2014-04-01'))])
    // // .range([0, 300]);
    // this.xAxis = d3.axisBottom(this.x).ticks(4);
    const svgContainer = d3.select('svg').attr('width', this.max_x + 30)
                                      .attr('height', this.max_y + 20).style('border', '1px solid black').call(xAxis).append('g')
      .attr('transform', 'translate(20, 20)');
    svgContainer.append('path').attr('d', lineFunction(this.lineData)).attr('stroke', 'blue')
      .attr('stroke-width', 2).attr('fill', 'none');
    // this.rects = this.svg.selectAll('rect')
    //   .data(this.sales);
    // this.newRects = this.rects.enter();
    // this.newRects.append('rect')
    //   .attr('x', this.x(0))
    //   .attr('y', (d, i) => this.y(d.product))
    //   .attr('height', this.y.bandwidth())
    //   .attr('width', (d, i) => this.x(d.count));
  }*/
  ngOnInit() {
    const lineFunction = d3.line().x(d => d.x * 5).y(d => d.y * 5).curve(d3.curveLinear);

    this.setMaxBoundaries();

    const axisScale = d3.scaleLinear().domain([0, 100]).range([0, this.max_x]);
    const xAxis = d3.axisBottom(axisScale);
    // this.maxCount = d3.max(this.sales, (d, i) => d.count);
    // this.y = d3.scaleBand().rangeRound([0, 75])
    //   .domain(this.sales.map((d, i) => d.product));
    // this.x = d3.scaleLinear()
    //   .range([0, 300])
    //   .domain([0, this.maxCount]);
    // // .domain([
    // //   new Date(Date.parse('2014-01-01')),
    // //   new Date(Date.parse('2014-04-01'))])
    // // .range([0, 300]);
    // this.xAxis = d3.axisBottom(this.x).ticks(4);
    const svgContainer = d3.select('svg').attr('width', this.max_x + 30)
      .attr('height', this.max_y + 20).style('border', '1px solid black').call(xAxis).append('g')
      .attr('transform', 'translate(20, 20)');
    svgContainer.append('path').attr('d', lineFunction(this.lineData)).attr('stroke', 'blue')
      .attr('stroke-width', 2).attr('fill', 'none');
  }

  // getSensor(): void {
  //   const id = +this.route.snapshot.paramMap.get('id');
  //   this.sensorService.getSensor(id).subscribe(sensor => this.sensor = sensor);
  // }

  goBack(): void {
    this.location.back();
  }

  setMaxBoundaries() {
    for (let i = 0; i < this.lineData.length; i++) {
      const tempx = this.lineData[i].x * 5;
      const tempy = this.lineData[i].y * 5;

      if (tempx > this.max_x) {
        this.max_x = tempx;
      }

      if (tempy > this.max_y) {
        this.max_y = tempy;
      }
    }
  }
}
