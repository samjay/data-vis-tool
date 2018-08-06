import { Component, OnInit, OnDestroy } from '@angular/core';
import * as d3 from 'd3';
import {height, margin, width} from '../common/svg-dimensions';
import {rygColors} from '../models/colors';
import {SENSORS} from '../sensor-list/sensors-list';
import {SensorLocation} from '../models/sensor-location';
import {SensorsService} from '../sensors.service';
import {PollingService} from '../polling.service';

@Component({
  selector: 'app-sensor-network',
  templateUrl: './sensor-network.component.html',
  styleUrls: ['./sensor-network.component.css']
})
export class SensorNetworkComponent implements OnInit, OnDestroy {

  svgContainer;
  xScale;
  yScale;
  /**
   * radius scale for cicle position in star network
   */
  radialScale;
  /**
   * width of signal line
   */
  lineWidthScale;
  /**
   * Option 2 data bar length
   */
  barLengthScale;
  /**
   * color of sensor location circle
   */
  circleColor;

  signalSensor = SENSORS[7];
  batterySensor = SENSORS[6];
  /**
   * tunnel data;
   */
  tunnel;
  selectedLocation: SensorLocation;
  // TODO get centerNode from data
  centerNode = {'x': 320, 'y': 450};
  sensorSource;
  currentSensorValues = [];
  option1;
  option2;
  pollingSubscription;

  constructor(private sensorService: SensorsService,
              private pollingService: PollingService) { }

  ngOnInit() {
    this.option1 = true;
    this.option2 = false;
    this.pollingSubscription = this.pollingService.pollingItem.subscribe( () => this.pollData());
    this.sensorService.getSensorNetwork().subscribe(sensorNodes => {
      this.sensorSource = sensorNodes;
      this.prepare();
      this.draw();
      this.pollingService.startPolling();
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
      currentVal.battery = batrsensor.data[batrsensor.data.length - 1].x;
      currentVal.signal = sgnlsensor.data[sgnlsensor.data.length - 1].x;
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
      .on('mouseover', (d, i) => this.showDetails(d, i, this.getxPos(i), this.getyPos(i)))
      .on('mouseout', (d, i) => this.hideDetails(d, i))
      .on('click', (d, i) => this.showChart(d, this.getxPos(i), this.getyPos(i)));

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

    this.barLengthScale = d3.scaleLinear() // TODO correct domain and range
      .domain([0, 100])
      .range([1, 350]);

    this.circleColor = d3.scaleQuantize()
      .domain([0, 100])
      .range(rygColors);

    // draw lines
    this.svgContainer.selectAll('line').data(this.currentSensorValues).enter()
      .append('line')
      .attr('id', (d, i) => 'line' + i)
      .attr('x1', 100).attr('y1', height / 2)
      .attr('x2', 400)
      .attr('y2', (d, i) => i * ( height / this.currentSensorValues.length) + 50 )
      .style('stroke-width', 4)
      .style('stroke', 'navy');

    // append circles for
    this.svgContainer.selectAll('circle').data(this.currentSensorValues).enter()
      .append('circle')
      .attr('id', (d, i) => 'circle2' + i)
      .attr('cx', 400)
      .attr('cy', (d, i) => i * ( height / this.currentSensorValues.length) + 50)
      .attr('r', 15)
      .attr('fill', 'white').attr('stroke', 'black').attr('stroke-width', 4)
      .each((d, i) => this.showBars(d, i, 400,  i * ( height / this.currentSensorValues.length) + 50))
      .on('mouseout', (d, i) => this.hideDetails(d, i))
      .on('click', (d, i) => this.showChart(d, 400, i * ( height / this.currentSensorValues.length) + 50));

    // add center node TODO show tooltip
    this.svgContainer.append('rect')
      .attr('x', 80)
      .attr('y', (height / 2) - 22)
      .attr('height', 40)
      .attr('width', 45)
      .attr('fill', 'navy');

    const axisScale = d3.scaleLinear().domain([0, 100]).range([485, 485 + this.barLengthScale(100)]);
    // Add grid
    this.svgContainer.append('g')
      .attr('class', 'grid')
      .attr('transform', 'translate(' + 0 + ', 25)')
      .call(d3.axisTop(axisScale)
        .tickSize( - height + 20 , 0, 0)
      );
  }

  animateElements() {
    for (let i = 0; i < this.currentSensorValues.length; i++) {
      if (this.option1) {
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
          .style('stroke-width', (d) => this.lineWidthScale(this.currentSensorValues[i].signal));
      }

      if (this.option2) {
        const batBar = d3.select('#batBar' + i);
        const sigBar = d3.select('#sigBar' + i);

        batBar.transition().duration(1000)
          .attr('width', this.barLengthScale(this.currentSensorValues[i].signal))
          .attr('fill', this.circleColor(this.currentSensorValues[i].signal));
        sigBar.transition().duration(1000)
          .attr('width', this.barLengthScale(this.currentSensorValues[i].battery))
          .attr('fill', this.circleColor(this.currentSensorValues[i].battery));
      }
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

  pollData() {
    this.sensorService.getSensorNetwork().subscribe(sensorNodes => {
      this.sensorSource = sensorNodes;
      this.prepare();
      this.animateElements();
    });
  }

  ngOnDestroy() {
    this.pollingService.stopPolling();
    this.pollingSubscription.unsubscribe();
  }

  /**
   * show details on mouseover of location
   * @param d datapoint, instance of sensor-location
   * @param i index
   * @param elem html element
   */
  showDetails(d, i, x, y) {

    // Add background rectangle and animate
    this.svgContainer.append('rect').attr('id', 'r' + d.x + '-' + d.y + '-' + i)
      .attr('x', () => x + 30)
      .attr('y', () => y - 25)
      .attr('width', 1).attr('height', 5)
      .attr('fill', 'darkblue')
      .transition().duration(500)
      .attr('width', 160).attr('height', 20);

    // add text
    this.svgContainer.append('text').attr('id', 't1' + d.x + '-' + d.y + '-' + i)
      .attr('x', () => x + 33)
      .attr('y', () => y - 10)
      .attr('font-size', 15).attr('font-family', 'helvetica').attr('fill', 'white')
      .text('Signal: ' + Math.round(this.currentSensorValues[i].signal)
        + ' | Battery: ' + Math.round(this.currentSensorValues[i].battery))
      .transition().delay(200).duration(500)
      .attr('fill-opacity', 1);
  }

  showBars(d, i, x, y) {
    this.svgContainer.append('rect').attr('id', 'sigBar' + i)
      .attr('x', () => x + 85)
      .attr('y', y - 20)
      .attr('width', this.barLengthScale(this.currentSensorValues[i].signal))
      .attr('height', 20)
      .attr('fill', this.circleColor(this.currentSensorValues[i].signal))
      .attr('stroke', 'black');

    this.svgContainer.append('rect').attr('id', 'batBar' + i)
      .attr('x', () => x + 85)
      .attr('y', y + 2)
      .attr('width', this.barLengthScale(this.currentSensorValues[i].battery))
      .attr('height', 20)
      .attr('fill', this.circleColor(this.currentSensorValues[i].battery))
      .attr('stroke', 'black');

    this.svgContainer.append('text').attr('id', 'sigText' + i)
      .attr('x', () => x + 30)
      .attr('y', () => y - 5)
      .attr('font-size', 15).attr('font-family', 'helvetica').attr('fill', 'black')
      .text('Signal')
      .attr('fill-opacity', 1);

    // add text
    this.svgContainer.append('text').attr('id', 'batText' + i)
      .attr('x', () => x + 30)
      .attr('y', () => y + 17)
      .attr('font-size', 15).attr('font-family', 'helvetica').attr('fill', 'black')
      .text('Battery')
      .attr('fill-opacity', 1);
  }

  /**
   * seperate method because recursive internal function
   * @param d datapoint
   */
  pulse(x, y) {
    d3.select('#pulseCircle').remove();
    const circle = this.svgContainer.append('circle')
      .attr('id', 'pulseCircle')
      .attr('cx', x)
      .attr('cy', y)
      .attr('r', 1)
      .style('fill', 'green').attr('fill-opacity', 0.8);
    repeat();
    function repeat() {
      circle
        .transition().duration(1000)
        .attr('r', 30)
        .attr('fill-opacity', 0.4)
        .transition().duration(10)
        .attr('r', 1)
        .attr('fill-opacity', 0.8)
        .on('end', repeat);
    }
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

  showChart(d, x, y) {
    this.selectedLocation = {id: d.location, sensor_list: [], x: 0, y: 0, z: 0, status_ok: true};
    for (let i = 0; i < 4; i++) {
      const normalizedCircle = d3.select('#circle' + i);
      normalizedCircle.transition()
        .duration(100)
        .attr('r', 15);
    }
    const circle = d3.select('#circle' + (d.location - 1));
    circle.transition()
      .duration(500)
      .attr('r', 23);
    if (this.option2) {
      this.pulse(x, y);
    }
  }

  switchOptions(num) {
    if (this.svgContainer) {
      this.svgContainer.remove();
    }
    if (num === 1) {
      this.option1 = true;
      this.option2 = false;
      this.draw();
    } else {
      this.option1 = false;
      this.option2 = true;
      this.draw2();
    }
  }
}
