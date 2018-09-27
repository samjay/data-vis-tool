import { Component, OnInit, OnDestroy } from '@angular/core';
import * as d3 from 'd3';
import {height, margin, svgViewboxHeight, svgViewboxWidth, width} from '../common/svg-dimensions';
import {colorTypes, rygColors} from '../models/colors';
import {SENSORS} from '../sensor-list/sensors-list';
import {SensorLocation} from '../models/sensor-location';
import {SensorsService} from '../sensors.service';
import {PollingService} from '../polling.service';
import {NgProgress} from 'ngx-progressbar';
import {ChartService} from '../chart.service';

@Component({
  selector: 'app-sensor-network',
  templateUrl: './sensor-network.component.html',
  styleUrls: ['./sensor-network.component.css']
})
export class SensorNetworkComponent implements OnInit, OnDestroy {

  svgContainer;
  keySvgContainer;
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
  centerNode = {'x': 320, 'y': 450, width: 45, height: 40};
  heightPadding = 200;
  sensorSource;
  currentSensorValues = [];
  option1 = true;
  option2 = false;
  pollingSubscription;
  circleNormalRadius = 15;
  realTimePlay = {
    buttonName: 'Play',
    playStatus: false
  };
  colorTypes = colorTypes;

  constructor(private sensorService: SensorsService,
              private pollingService: PollingService, private chartService: ChartService,
              public ngProgress: NgProgress) { }

  ngOnInit() {
    this.pollingSubscription = this.pollingService.pollingItem.subscribe( () => this.pollData());
    this.ngProgress.start();
    this.sensorService.getSensorNetwork().subscribe(sensorNodes => {
      this.sensorSource = sensorNodes;
      this.prepare();
      this.draw();
      this.ngProgress.done();
      // this.pollingService.startPolling(); TODO: uncomment after user study
    });
  }

  prepare() {
    this.currentSensorValues = [];
    for (let i = 1; i <= 4; i++) { // TODO fix for all locations from back
      let batrsensor;
      let sgnlsensor;
      batrsensor = this.sensorSource.find((_sensor) => {
        return _sensor.id === i + this.batterySensor.id;
      });
      sgnlsensor = this.sensorSource.find((_sensor) => {
        return _sensor.id === i + this.signalSensor.id;
      });
      const currentVal = {'battery': 0, 'signal': 0, location: 0 };
      currentVal.battery = batrsensor.data[batrsensor.data.length - 1].x;
      currentVal.signal = sgnlsensor.data[sgnlsensor.data.length - 1].x;
      currentVal.location = i;
      this.currentSensorValues.push(currentVal);
    }
  }

  draw() {
    this.svgContainer = d3.select('#sensorNetChart').append('svg');
    this.chartService.svgDimensionInit(this.svgContainer, svgViewboxWidth, svgViewboxHeight);

    this.xScale = d3.scaleLinear()
      .domain([1, 1000])
      .range([margin.left, width + 300]);

    this.yScale = d3.scaleLinear()
      .domain([1, 700])
      .range([margin.top, height]);

    this.radialScale = d3.scaleLinear() // TODO correct domain and range
      .domain([0, 100])
      .range([320, 60]);

    this.lineWidthScale = d3.scaleLinear() // TODO correct domain and range
      .domain([0, 100])
      .range([2, 10]);

    this.circleColor = d3.scaleQuantize() // TODO correct domain and range
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
      .attr('r', this.circleNormalRadius)
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
      .attr('fill', 'navy')
      .on('mouseover', (d, i) => this.showCenterDetails(d, i, this.xScale(this.centerNode.x) - 20,
        this.yScale(this.centerNode.y) - 22))
      .on('mouseout', (d, i) => this.hideCenterDetails(i));

    // Show key

    this.keySvgContainer = d3.select('#signalKey').append('svg').attr('width', 800)
      .attr('height', 200);

    this.keySvgContainer.append('line')
      .attr('x1', 22 + 28)
      .attr('y1', 50)
      .attr('x2', 50 + this.getxVal(this.radialScale(0), 0))
      .attr('y2', 50)
      .style('stroke-width', (d) => this.lineWidthScale(0))
      .style('stroke', 'green');

    this.keySvgContainer.append('rect')
      .attr('x', 28)
      .attr('y', 30)
      .attr('height', 40)
      .attr('width', 45)
      .attr('fill', 'navy');

    this.keySvgContainer.append('text')
      .attr('x', 0)
      .attr('y', 50)
      .text('0')
      .attr('font-size', 15).attr('font-family', 'helvetica').attr('fill', 'black');

    this.keySvgContainer.append('line')
      .attr('x1', 22 + 28)
      .attr('y1', 110)
      .attr('x2', 50 +  this.getxVal(this.radialScale(100), 0))
      .attr('y2', 110)
      .style('stroke-width', (d) => this.lineWidthScale(100))
      .style('stroke', 'green');

    this.keySvgContainer.append('rect')
      .attr('x', 28)
      .attr('y', 90)
      .attr('height', 40)
      .attr('width', 45)
      .attr('fill', 'navy');

    this.keySvgContainer.append('text')
      .attr('x', 0)
      .attr('y', 110)
      .text('100')
      .attr('font-size', 15).attr('font-family', 'helvetica').attr('fill', 'black');

  }

  draw2() {

    const xPos1 = 100;
    const xPos2 = 400;
    const axisXPos = 485;
    const axisPadding = 25;

    this.svgContainer = d3.select('#sensorNetChart').append('svg');
    this.chartService.svgDimensionInit(this.svgContainer, svgViewboxWidth, svgViewboxHeight);

    this.xScale = d3.scaleLinear()
      .domain([1, 1000]) // TODO get domain from data
      .range([margin.left, width + 300]);

    this.yScale = d3.scaleLinear()
      .domain([1, 700]) // TODO get domain from data
      .range([margin.top, height]);

    this.barLengthScale = d3.scaleLinear() // TODO correct domain and range
      .domain([0, 100])
      .range([1, 450]);

    this.circleColor = d3.scaleQuantize()
      .domain([0, 100])
      .range(rygColors);

    // draw lines
    this.svgContainer.selectAll('line').data(this.currentSensorValues).enter()
      .append('line')
      .attr('id', (d, i) => 'line' + i)
      .attr('x1', xPos1).attr('y1', height / 2)
      .attr('x2', xPos2)
      .attr('y2', (d, i) => i * ( height / this.currentSensorValues.length) + margin.bottom )
      .style('stroke-width', 4)
      .style('stroke', 'navy');

    // append circles for
    this.svgContainer.selectAll('circle').data(this.currentSensorValues).enter()
      .append('circle')
      .attr('id', (d, i) => 'circle2' + i)
      .attr('cx', xPos2)
      .attr('cy', (d, i) => i * ( height / this.currentSensorValues.length) + margin.bottom )
      .attr('r', 15)
      .attr('fill', 'white').attr('stroke', 'black').attr('stroke-width', 4)
      .each((d, i) => this.showBars(d, i, xPos2,  i * ( height / this.currentSensorValues.length) + margin.bottom))
      .on('mouseover', (d, i) => this.showDetails(d, i, xPos2, i * ( height / this.currentSensorValues.length) + margin.bottom))
      .on('mouseout', (d, i) => this.hideDetails(d, i))
      .on('click', (d, i) => this.showChart(d, xPos2, i * ( height / this.currentSensorValues.length) + margin.bottom));

    // add center node
    this.svgContainer.append('rect')
      .attr('x', xPos1 - this.centerNode.width / 2)
      .attr('y', (height / 2) - this.centerNode.height / 2)
      .attr('height', this.centerNode.height)
      .attr('width', this.centerNode.width)
      .attr('fill', 'navy')
      .on('mouseover', (d, i) => this.showCenterDetails(d, i, xPos1 - this.centerNode.width / 2, (height / 2) - this.centerNode.height / 2))
      .on('mouseout', (d, i) => this.hideCenterDetails(i));

    const axisScale = d3.scaleLinear().domain([0, 100]).range([axisXPos, axisXPos + this.barLengthScale(100)]);
    // Add grid
    this.svgContainer.append('g')
      .attr('class', 'grid')
      .attr('transform', 'translate(' + 0 + ', ' + axisPadding + ')')
      .call(d3.axisTop(axisScale)
        .tickSize( - height + margin.top , 0, 0)
      );
  }

  showCenterDetails(d, i, x, y) {
    const animationDuration = 500;
    const toolTipRect = {padding: {x: 30, y: 25}, pre: { width: 1, height: 5}, post: {width: 100, height: 20}};
    const toolTipText = {padding: {x: 33, y: 10}};

    // Add background rectangle and animate
    this.svgContainer.append('rect').attr('id', 'r' + i)
      .attr('x', () => x + toolTipRect.padding.x)
      .attr('y', () => y - toolTipRect.padding.y)
      .attr('width', toolTipRect.pre.width).attr('height', toolTipRect.post.height)
      .attr('fill', 'darkblue')
      .transition().duration(animationDuration)
      .attr('width', toolTipRect.post.width).attr('height', toolTipRect.post.height);

    // add text
    this.svgContainer.append('text').attr('id', 't1' + i)
      .attr('x', () => x + toolTipText.padding.x)
      .attr('y', () => y - toolTipText.padding.y)
      .attr('font-size', 15).attr('font-family', 'helvetica').attr('fill', 'white')
      .text('Central Node')
      .attr('fill-opacity', 0.1)
      .transition().delay(200).duration(animationDuration)
      .attr('fill-opacity', 1);
  }

  /**
   * TODO: remove after user study
   */
  playRealTime() {
    if (!this.realTimePlay.playStatus) {
      this.realTimePlay.playStatus = true;
      this.realTimePlay.buttonName = 'Pause';
      this.pollingService.startPolling();
    } else {
      this.realTimePlay.playStatus = false;
      this.realTimePlay.buttonName = 'Play';
      this.pollingService.stopPolling();
    }
  }

  animateElements() {
    const animationDuration = 1000;
    for (let i = 0; i < this.currentSensorValues.length; i++) {
      if (this.option1) {
        const circle = d3.select('#circle' + i);
        const line = d3.select('#line' + i);
        circle
          .transition().duration(animationDuration)
          .attr('cx', this.getxPos(i))
          .attr('cy', this.getyPos(i))
          .attr('fill', this.circleColor(this.currentSensorValues[i].battery));

        line.transition().duration(animationDuration)
          .attr('x1', this.xScale(this.centerNode.x)).attr('y1', this.yScale(this.centerNode.y))
          .attr('x2', this.getxPos(i))
          .attr('y2', this.getyPos(i))
          .style('stroke-width', (d) => this.lineWidthScale(this.currentSensorValues[i].signal));
      }

      if (this.option2) {
        const batBar = d3.select('#batBar' + i);
        const sigBar = d3.select('#sigBar' + i);

        sigBar.transition().duration(animationDuration)
          .attr('width', this.barLengthScale(this.positiveBarLength(this.currentSensorValues[i].signal)))
          .attr('fill', this.circleColor(this.positiveBarLength(this.currentSensorValues[i].signal)));
        batBar.transition().duration(animationDuration)
          .attr('width', this.barLengthScale(this.positiveBarLength(this.currentSensorValues[i].battery)))
          .attr('fill', this.circleColor(this.positiveBarLength(this.currentSensorValues[i].battery)));
      }
    }
  }

  positiveBarLength(val) {
    return val <= 0 ? 0 : val;
  }



  getxVal(r, angle) {
    return r * Math.cos(angle);
  }

  getyVal(r, angle) {
    return r * Math.sin(angle);
  }

  getxPos(i) {
    return this.xScale(this.centerNode.x) +
      this.getxVal(this.radialScale(this.currentSensorValues[i].signal),
        (360 / this.currentSensorValues.length) * i);
  }

  getyPos(i) {
    return this.yScale(this.centerNode.y) -
      this.getyVal(this.radialScale(this.currentSensorValues[i].signal),
        (360 / this.currentSensorValues.length) * i);
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
    const animationDuration = 500;
    const toolTipRect = {padding: {x: 30, y: 25}, pre: { width: 1, height: 5}, post: {width: 160, height: 40}};
    const toolTipText = {padding: {x: 33, y: 10}};

    // Add background rectangle and animate
    this.svgContainer.append('rect').attr('id', 'r' + d.x + '-' + d.y + '-' + i)
      .attr('x', () => x + toolTipRect.padding.x)
      .attr('y', () => y - toolTipRect.padding.y)
      .attr('width', toolTipRect.pre.width).attr('height', toolTipRect.post.height)
      .attr('fill', 'darkblue')
      .transition().duration(animationDuration)
      .attr('width', toolTipRect.post.width).attr('height', toolTipRect.post.height);

    // add text
    this.svgContainer.append('text').attr('id', 't1' + d.x + '-' + d.y + '-' + i)
      .attr('x', () => x + toolTipText.padding.x)
      .attr('y', () => y - toolTipText.padding.y)
      .attr('font-size', 15).attr('font-family', 'helvetica').attr('fill', 'white')
      .text('Location: ' + (i + 1))
      .attr('fill-opacity', 0.1)
      .transition().delay(200).duration(animationDuration)
      .attr('fill-opacity', 1);

    this.svgContainer.append('text').attr('id', 't2' + d.x + '-' + d.y + '-' + i)
      .attr('x', () => x + toolTipText.padding.x)
      .attr('y', () => y - toolTipText.padding.y + 15)
      .attr('font-size', 15).attr('font-family', 'helvetica').attr('fill', 'white')
      .text('Signal: ' + Math.round(this.currentSensorValues[i].signal)
        + ' | Battery: ' + Math.round(this.currentSensorValues[i].battery))
      .attr('fill-opacity', 0.1)
      .transition().delay(200).duration(animationDuration)
      .attr('fill-opacity', 1);

  }

  showBars(d, i, x, y) {
    const rectPosPadding = {x: 85, y: 20};
    const textPosPadding = {x: 30, y: 5};
    const barGap = 2;
    const barHeight = 20;
    this.svgContainer.append('rect').attr('id', 'sigBar' + i)
      .attr('x', x + rectPosPadding.x)
      .attr('y', y - rectPosPadding.y)
      .attr('width', this.barLengthScale(this.currentSensorValues[i].signal))
      .attr('height', barHeight)
      .attr('fill', this.circleColor(this.currentSensorValues[i].signal))
      .attr('stroke', 'black');

    this.svgContainer.append('rect').attr('id', 'batBar' + i)
      .attr('x', x + rectPosPadding.x)
      .attr('y', y + barGap)
      .attr('width', this.barLengthScale(this.currentSensorValues[i].battery))
      .attr('height', barHeight)
      .attr('fill', this.circleColor(this.currentSensorValues[i].battery))
      .attr('stroke', 'black');

    this.svgContainer.append('text').attr('id', 'sigText' + i)
      .attr('x', () => x + textPosPadding.x)
      .attr('y', () => y - textPosPadding.y)
      .attr('font-size', 15).attr('font-family', 'helvetica').attr('fill', 'black')
      .text('Signal')
      .attr('fill-opacity', 1);

    // add text
    this.svgContainer.append('text').attr('id', 'batText' + i)
      .attr('x', () => x + textPosPadding.x)
      .attr('y', () => y  - textPosPadding.y + barHeight)
      .attr('font-size', 15).attr('font-family', 'helvetica').attr('fill', 'black')
      .text('Battery')
      .attr('fill-opacity', 1);
  }

  /**
   * seperate method because recursive internal function
   * @param d datapoint
   */
  pulse(x, y) {
    const animationDuration = 1000;
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
        .transition().duration(animationDuration)
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
  hideCenterDetails(i) {
    d3.select('#t1' + i).remove();
    d3.select('#r' + i).remove();
  }

  showChart(d, x, y) {
    const animationDuration = 500;
    this.selectedLocation = {id: d.location, sensor_list: [], x: 0, y: 0, z: 0, status_ok: true};
    for (let i = 0; i < 4; i++) {
      const normalizedCircle = d3.select('#circle' + i);
      normalizedCircle.transition()
        .duration(100)
        .attr('r', this.circleNormalRadius);
    }
    const circle = d3.select('#circle' + (d.location - 1));
    circle.transition()
      .duration(animationDuration)
      .attr('r', 25);
    if (this.option2) {
      this.pulse(x, y);
    }
  }

  switchOptions(num) {
    if (this.svgContainer) {
      this.svgContainer.remove();
    }
    if (this.keySvgContainer) {
      this.keySvgContainer.remove();
    }
    this.selectedLocation = null;
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
