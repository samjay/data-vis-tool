import { Component, OnInit, OnDestroy } from '@angular/core';
import * as d3 from 'd3';
import {height, margin, width} from '../common/svg-dimensions';
import {rygColors} from '../models/colors';
import {SENSORS} from '../sensor-list/sensors-list';
import {SensorLocation} from '../models/sensor-location';
import {SensorsService} from '../sensors.service';

@Component({
  selector: 'app-sensor-network',
  templateUrl: './sensor-network.component.html',
  styleUrls: ['./sensor-network.component.css']
})
export class SensorNetworkComponent implements OnInit, OnDestroy {

  svgContainer;
  xScale;
  yScale;
  radialScale;
  lineWidthScale;
  circleColor;
  signalSensor = SENSORS[7];
  batterySensor = SENSORS[6];
  tunnel;
  selectedLocation: SensorLocation;
  // TODO get centerNode and sensorNodes from data
  centerNode = {'x': 320, 'y': 450};
  sensorSource;
  currentSensorValues = [];

  animateID;

  constructor(private sensorService: SensorsService) { }

  ngOnInit() {
    this.sensorService.getSensorNetwork().subscribe(sensorNodes => {
      this.sensorSource = sensorNodes;
      this.prepare();
      this.draw2();
      // this.animate();
    });
  }

  prepare() {
    this.currentSensorValues = [];
    for (let i = 1; i <= 4; i++) {
      let batrsensor;
      let sgnlsensor;
      batrsensor = this.sensorSource.find((_sensor) => {
        return _sensor.id === i + 'G';
      });
      sgnlsensor = this.sensorSource.find((_sensor) => {
        return _sensor.id === i + 'H';
      });
      const currentVal = {'battery': 0, 'signal': 0, location: 0 };
      currentVal.battery = batrsensor.data[batrsensor.data.length - 3].x;
      currentVal.signal = sgnlsensor.data[sgnlsensor.data.length - 3].x;
      currentVal.location = i;
      this.currentSensorValues.push(currentVal);
    }
  }

  draw() {
    this.svgContainer = d3.select('#sensorNetChart').append('svg')
      .attr('width',  width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom + 200).attr('style', 'margin-top 30px');

    this.xScale = d3.scaleLinear()
      .domain([1, 1000]) // TODO get domain from data
      .range([margin.left, width]);

    this.yScale = d3.scaleLinear()
      .domain([1, 700]) // TODO get domain from data
      .range([margin.top, height]);

    this.radialScale = d3.scaleLinear() // TODO correct domain and range
      .domain([0, 100])
      .range([320, 60]);

    this.lineWidthScale = d3.scaleLinear() // TODO correct domain and range
      .domain([0, 100])
      .range([2, 10]);

    this.circleColor = d3.scaleQuantize()
      .domain([0, 100])
      .range(rygColors);


    // draw lines
    this.svgContainer.selectAll('line').data(this.currentSensorValues).enter()
      .append('line')
      .attr('id', (d, i) => 'line' + i)
      .attr('x1', this.xScale(this.centerNode.x)).attr('y1', this.yScale(this.centerNode.y))
      .attr('x2', (d, i) =>
        this.xScale(this.centerNode.x) +
        this.getxVal(this.radialScale(d.signal), (360 / this.currentSensorValues.length) * i))
      .attr('y2', (d, i) =>
        this.yScale(this.centerNode.y) -
        this.getyVal(this.radialScale(d.signal), (360 / this.currentSensorValues.length) * i))
      .style('stroke-width', (d) => this.lineWidthScale(d.signal))
      .style('stroke', 'green');

    // append circles for
    this.svgContainer.selectAll('circle').data(this.currentSensorValues).enter()
      .append('circle')
      .attr('id', (d, i) => 'circle' + i)
      .attr('cx', (d, i) =>
        this.xScale(this.centerNode.x) +
        this.getxVal(this.radialScale(d.signal), (360 / this.currentSensorValues.length) * i))
      .attr('cy', (d, i) =>
        this.yScale(this.centerNode.y) -
        this.getyVal(this.radialScale(d.signal), (360 / this.currentSensorValues.length) * i))
      .attr('r', 15)
      .attr('fill', (d) => this.circleColor(d.battery)).attr('stroke', 'black').attr('stroke-width', 4)
      .on('mouseover', (d, i) => this.showDetails(d, i))
      .on('mouseout', (d, i) => this.hideDetails(d, i))
      .on('click', (d, i) => this.showChart(d, i));

    // add center node TODO show tooltip
    this.svgContainer.append('rect')
      .attr('x', this.xScale(this.centerNode.x) - 20)
      .attr('y', this.yScale(this.centerNode.y) - 22)
      .attr('height', 40)
      .attr('width', 45)
      .attr('fill', 'navy');

  }

  draw2() {
    this.svgContainer = d3.select('#sensorNetChart2').append('svg')
      .attr('width',  width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom + 200).attr('style', 'margin-top 30px');

    this.xScale = d3.scaleLinear()
      .domain([1, 1000]) // TODO get domain from data
      .range([margin.left, width]);

    this.yScale = d3.scaleLinear()
      .domain([1, 700]) // TODO get domain from data
      .range([margin.top, height]);

    // draw lines
    this.svgContainer.selectAll('line').data(this.currentSensorValues).enter()
      .append('line')
      .attr('id', (d, i) => 'line' + i)
      .attr('x1', 100).attr('y1', height / 2)
      .attr('x2', 400)
      .attr('y2', (d, i) => i * ( height / this.currentSensorValues.length) + 20 )
      .style('stroke-width', 4)
      .style('stroke', 'green');

    // append circles for
    this.svgContainer.selectAll('circle').data(this.currentSensorValues).enter()
      .append('circle')
      .attr('id', (d, i) => 'circle' + i)
      .attr('cx', (d, i) =>
        this.xScale(this.centerNode.x) +
        this.getxVal(this.radialScale(d.signal), (360 / this.currentSensorValues.length) * i))
      .attr('cy', (d, i) =>
        this.yScale(this.centerNode.y) -
        this.getyVal(this.radialScale(d.signal), (360 / this.currentSensorValues.length) * i))
      .attr('r', 15)
      .attr('fill', (d) => this.circleColor(d.battery)).attr('stroke', 'black').attr('stroke-width', 4)
      .on('mouseover', (d, i) => this.showDetails(d, i))
      .on('mouseout', (d, i) => this.hideDetails(d, i))
      .on('click', (d, i) => this.showChart(d, i));

    // add center node TODO show tooltip
    this.svgContainer.append('rect')
      .attr('x', 80)
      .attr('y', (height / 2) - 22)
      .attr('height', 40)
      .attr('width', 45)
      .attr('fill', 'navy');

  }

  animateElements() {
    for (let i = 0; i < this.currentSensorValues.length; i++) {
      const circle = d3.select('#circle' + i);
      const line = d3.select('#line' + i);
      circle
        .transition().duration(1000)
        .attr('cx', this.getxPos(i))
        .attr('cy', this.getyPos(i))
        .attr('fill', this.circleColor(this.currentSensorValues[i].battery));

    line.transition().duration(1000)
        .attr('x1', this.xScale(this.centerNode.x)).attr('y1', this.yScale(this.centerNode.y))
        .attr('x2', this.getxPos(i))
        .attr('y2', this.getyPos(i))
        .style('stroke', 'green').style('stroke-width', (d) => this.lineWidthScale(d.signal));
    }
  }


  getxVal(r, angle) {
    return r * Math.cos(angle);
  }

  getyVal(r, angle) {
    return r * Math.sin(angle);
  }

  getxPos(i) {
    return this.xScale(this.centerNode.x) +
      this.getxVal(this.radialScale(this.currentSensorValues[i].signal), (360 / this.currentSensorValues.length) * i);
  }

  getyPos(i) {
    return this.yScale(this.centerNode.y) -
      this.getyVal(this.radialScale(this.currentSensorValues[i].signal), (360 / this.currentSensorValues.length) * i);
  }
  animate() {
    this.animateID = window.setInterval(() => {
      this.pollData();
    }, 4000);
  }

  pollData() {
    this.sensorService.getSensorNetwork().subscribe(sensorNodes => {
      this.sensorSource = sensorNodes;
      this.prepare();
      this.animateElements();
    });
  }

  ngOnDestroy() {
    if (this.animateID) {
      window.clearInterval(this.animateID);
    }
  }

  /**
   * show details on mouseover of location
   * @param d datapoint, instance of sensor-location
   * @param i index
   * @param elem html element
   */
  showDetails(d, i) {

    // Add background rectangle and animate
    this.svgContainer.append('rect').attr('id', 'r' + d.x + '-' + d.y + '-' + i)
      .attr('x', () => this.getxPos(i) + 30)
      .attr('y', () => this.getyPos(i) - 25)
      .attr('width', 1).attr('height', 5)
      .attr('fill', 'darkblue')
      .transition().duration(500)
      .attr('width', 160).attr('height', 20);

    // add text
    this.svgContainer.append('text').attr('id', 't1' + d.x + '-' + d.y + '-' + i)
      .attr('x', () => this.getxPos(i) + 33)
      .attr('y', () => this.getyPos(i) - 10)
      .attr('font-size', 15).attr('font-family', 'helvetica').attr('fill', 'white')
      .text('Signal: ' + Math.round(this.currentSensorValues[i].signal)
        + ' | Battery: ' + Math.round(this.currentSensorValues[i].battery))
      .transition().delay(200).duration(500)
      .attr('fill-opacity', 1);
  }

  /**
   * hide details when mouse out of circle
   * @param d data point
   * @param i index
   * @param elem html element
   */
  hideDetails(d, i) {
    d3.select('#t1' + d.x + '-' + d.y + '-' + i).remove();
    d3.select('#t2' + d.x + '-' + d.y + '-' + i).remove();
    d3.select('#r' + d.x + '-' + d.y + '-' + i).remove();
  }

  showChart(d, i) {
    this.selectedLocation = {id: d.location, sensor_list: [], x: 0, y: 0, z: 0, status_ok: true};
  }
}
