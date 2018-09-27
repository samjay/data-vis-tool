import {Component, OnDestroy, OnInit} from '@angular/core';
import * as d3 from 'd3';
import { margin } from '../common/svg-dimensions';
import {SensorsService} from '../sensors.service';
import {PollingService} from '../polling.service';
import {SENSORS} from '../sensor-list/sensors-list';
import {NgProgress} from 'ngx-progressbar';
import {ChartService} from '../chart.service';

@Component({
  selector: 'app-sensor-movement',
  templateUrl: './sensor-movement.component.html',
  styleUrls: ['./sensor-movement.component.css']
})
export class SensorMovementComponent implements OnInit, OnDestroy {

  svgContainer;
  zoom;
  xGrid;
  xGridAxis;
  yGrid;
  yGridAxis;
  legendSvg;
  /*
  sensor data array from source
   */
  sensorSource;
  /*
  filtered position data
   */
  positionData;
  positionCircle = {radius: 20, strokeWidth: 3};
  /*
  filtered accelorometer data
   */
  accelerometerData;
  xScale;
  yScale;

  /*
  scale for the length of the acceleration line
   */
  lineLengthScale;
  /*
  height and width override for bigger map
   */
  height = 700;
  width = 1400;
  centerNode = {'x': 9.220, 'y': 48.84, width: 45, height: 40};
  pollingSubscription;
  acceleration = {source: {min: -16, max: 16},
    line: {min: -100, max: 100}};
  accelerationLine = { strokeWidth: 2 };
  grid = {margin: {top: 40}};

  constructor(private sensorService: SensorsService,
              private pollingService: PollingService, private chartService: ChartService,
              public ngProgress: NgProgress) { }

  ngOnInit() {

    // TODO domain lineMin and max
    this.xScale = d3.scaleLinear().domain([9.200, 9.280]).range([margin.left, this.width - margin.right]);
    this.yScale = d3.scaleLinear().domain([48.796, 48.9]).range([this.height - margin.bottom, margin.top]);
    // accelerometer values range from -16 to 16.
    this.lineLengthScale = d3.scaleLinear()
      .domain([this.acceleration.source.min, this.acceleration.source.max])
      .range([this.acceleration.line.min, this.acceleration.line.max]);
    console.log(this.lineLengthScale(10));

    // show acceleration legend
    this.legendSvg = d3.select('#legend').append('svg').attr('width', 200)
      .attr('height', 100);

    this.pollingSubscription = this.pollingService.pollingItem.subscribe(() => this.pollData());

    this.ngProgress.start();
    this.sensorService.getSensorNetwork().subscribe(sensorNodes => {
        this.sensorSource = sensorNodes;
        this.prepare();
        this.draw();
        this.ngProgress.done();
        this.pollingService.startPolling();
    });
  }

  /**
   * filter the position and accelerometer sensors from the sensor network.
   * sensors 3 and 9 respectively
   */
  prepare() {
    this.positionData = this.sensorSource.filter(sensorFilter => sensorFilter.id.endsWith(SENSORS[3].id));
    this.accelerometerData = this.sensorSource.filter(sensorFilter => sensorFilter.id.endsWith(SENSORS[9].id));
  }

  draw() {
    if (this.svgContainer) {
      this.svgContainer.remove();
    }

    this.svgContainer = d3.select('#sensorPosChart').append('svg');
    this.chartService.svgDimensionInit(this.svgContainer, this.width, this.height);

    // this.addZoom();
    this.svgContainer.append('svg:image').attr('xlink:href', 'assets/map_sample.JPG').attr('opacity', 0.5);
    // Add grid
    this.xGridAxis = d3.axisBottom(this.xScale).tickSize( this.height , 0, 0);
    this.xGrid = this.svgContainer.append('g')
      .attr('class', 'grid')
      .attr('transform', 'translate(' + 0 + ', ' + -margin.top + ')')
      .call(this.xGridAxis);
    this.yGridAxis = d3.axisLeft(this.yScale).tickSize( - this.width , 0, 0);
    this.yGrid = this.svgContainer.append('g')
      .attr('class', 'grid')
      .attr('transform', 'translate(' + margin.left + ', 0)')
      .call(this.yGridAxis);

    // add position circles
    this.svgContainer.selectAll('circle').data(this.positionData).enter()
      .append('circle')
      .attr('id', (d) => 'sensorPosCircle' + d.id)
      .attr('cx', (d) => {
        return this.xScale(d.data[d.data.length - 2].x); // TODO getting the last second value for this, fix
      })
      .attr('cy', (d) => this.yScale(d.data[d.data.length - 2].y))
      .attr('r', this.positionCircle.radius)
      .attr('fill', 'white')
      .on('mouseover', (d, i) => this.showDetails(d, i, this.xScale(d.data[d.data.length - 2].x), this.yScale(d.data[d.data.length - 2].y)))
      .on('mouseout', (d, i, elem) => this.hideDetails(d, i, elem))
      .attr('stroke', 'black')
      .attr('stroke-width', this.positionCircle.strokeWidth);

    // draw acceleration lines
    let accelerometer;
    this.svgContainer.selectAll('.acctline').data(this.positionData).enter()
      .append('line')
      .attr('id', (d) => 'sensorAccLine' + d.id)
      .attr('x1', (d) => {
         return this.xScale(d.data[d.data.length - 2].x);
      })
      .attr('y1', (d) => this.yScale(d.data[d.data.length - 2].y))
      .attr('x2', (d) => {
        // find sensor of same location id
        accelerometer = this.accelerometerData.find( accel => accel.id.charAt(0) === (d.id.charAt(0)));
        return this.xScale(d.data[d.data.length - 2].x) +
          this.lineLengthScale(accelerometer.data[accelerometer.data.length - 1].x); // TODO getting the last value for current, fix
      })
      .attr('y2', (d) => {
        accelerometer = this.accelerometerData.find( accel => accel.id.charAt(0) === (d.id.charAt(0)));
        return this.yScale(d.data[d.data.length - 2].y) +
          this.lineLengthScale(accelerometer.data[accelerometer.data.length - 1].y);
      })
      .attr('stroke-width', this.accelerationLine.strokeWidth)
      .attr('stroke', 'blue');

    // draw central connection lines
    this.svgContainer.selectAll('.centralLine').data(this.positionData).enter()
      .append('line')
      .attr('id', (d) => 'centerLine' + d.id)
      .attr('x1', this.xScale(this.centerNode.x))
      .attr('y1', this.yScale(this.centerNode.y))
      .attr('x2', (d) => this.xScale(d.data[d.data.length - 2].x))
      .attr('y2', (d) => this.yScale(d.data[d.data.length - 2].y))
      .attr('stroke', 'lightBlue')
      .attr('stroke-width', 1);

    // add center node TODO show tooltip
    this.svgContainer.append('rect')
      .attr('x', this.xScale(this.centerNode.x) - this.centerNode.width / 2)
      .attr('y', this.yScale(this.centerNode.y) - this.centerNode.height / 2)
      .attr('height', this.centerNode.height)
      .attr('width', this.centerNode.width)
      .attr('fill', 'navy')
      .on('mouseover', (d, i) => this.showCenterDetails(d, i, this.xScale(this.centerNode.x) - this.centerNode.width / 2,
        this.yScale(this.centerNode.y) - this.centerNode.height / 2))
      .on('mouseout', (d, i) => this.hideCenterDetails(i));

    // add legend
    const xposition = 1200;
    const yposition = 50;
    this.svgContainer.append('line')
      .attr('x1', xposition)
      .attr('y1', yposition)
      .attr('x2', xposition + this.lineLengthScale(this.acceleration.source.max))
      .attr('y2', yposition)
      .attr('stroke-width', this.accelerationLine.strokeWidth)
      .attr('stroke', 'blue');
    const axisScale = d3.scaleLinear().domain([0, this.acceleration.source.max]).range([0, this.acceleration.line.max]);
    // Add legend axis
    this.svgContainer.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(' + xposition  + ', ' + yposition + ')')
      .call(d3.axisBottom(axisScale).ticks(5));

    this.svgContainer.append('text')
      .attr('x', xposition)
      .attr('y', yposition - 4)
      .text('Acceleration')
      .attr('font-size', 15).attr('font-family', 'helvetica').attr('fill', 'black');

  }

  /**
   * show details on mouseover of location
   * @param d datapoint, instance of sensor-location
   * @param i index
   * @param elem html element
   */
  showDetails(d, i, x, y) {
    const toolTipRect = {padding: {x: 30, y: 25}, pre: { width: 1, height: 5}, post: {width: 100, height: 20}};
    const toolTipText = {padding: {x: 33, y: 10}};
    const animationDuration = 500;
    let locationId;
    if (d.id > 4) {
      locationId = (d.id % 4) + 1;
    } else {
      locationId = d.id;
    }

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
      .text('Location: ' + d.id)
      .attr('fill-opacity', 0.1)
      .transition().delay(200).duration(animationDuration)
      .attr('fill-opacity', 1);
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
  hideCenterDetails(i) {
    d3.select('#t1' + i).remove();
    d3.select('#r' + i).remove();
  }

  /**
   * hide details when mouse out of circle
   * @param d data point
   * @param i index
   * @param elem html element
   */
  hideDetails(d, i, elem) {
    const circle = d3.select(elem[i]);
    d3.select('#t1' + d.x + '-' + d.y + '-' + i).remove();
    d3.select('#r' + d.x + '-' + d.y + '-' + i).remove();
  }

  addZoom() {
    this.zoom = d3.zoom()
      .scaleExtent([1, 10])
      .on('zoom', () => {
        this.svgContainer.attr('transform', d3.event.transform);
      });

    this.svgContainer.call(this.zoom);

  }

  resetZoom() {
    this.svgContainer.transition()
      .duration(750)
      .call(this.zoom.transform, d3.zoomIdentity);
  }

  /**
   * request new sensor network again
   */
  pollData() {
    this.sensorService.getSensorNetwork().subscribe(sensorNodes => {
      this.sensorSource = sensorNodes;
      this.prepare();
      this.animatePosition();
    });
  }

  /**
   * animate the position and acceleration with the updated values from polling
   */
  animatePosition() {
    const animationDuration = 1000;
    this.positionData.forEach((positionSensor) => {
      const circle = d3.select('#sensorPosCircle' + positionSensor.id);
      circle.transition().duration(animationDuration)
        .attr('cx', () => {
          return this.xScale(positionSensor.data[positionSensor.data.length - 2].x);
        })
        .attr('cy', () => this.yScale(positionSensor.data[positionSensor.data.length - 2].y));

      const line = d3.select('#sensorAccLine' + positionSensor.id);
      line.transition().duration(animationDuration)
        .attr('x1', this.xScale(positionSensor.data[positionSensor.data.length - 2].x))
        .attr('y1', this.yScale(positionSensor.data[positionSensor.data.length - 2].y))
        .attr('x2', () => {
          const accelerometer = this.accelerometerData
            .find( accel => accel.id.charAt(0) === (positionSensor.id.charAt(0)));
          return this.xScale(positionSensor.data[positionSensor.data.length - 2].x) +
            this.lineLengthScale(accelerometer.data[accelerometer.data.length - 1].x);
        })
        .attr('y2', () => {
          const accelerometer = this.accelerometerData
            .find( accel => accel.id.charAt(0) === (positionSensor.id.charAt(0)));
          return this.yScale(positionSensor.data[positionSensor.data.length - 2].y) +
            this.lineLengthScale(accelerometer.data[accelerometer.data.length - 1].y);
        });

      const centerLine = d3.select('#centerLine' + positionSensor.id);
      centerLine.transition().duration(animationDuration)
        .attr('x2', this.xScale(positionSensor.data[positionSensor.data.length - 2].x))
        .attr('y2', this.yScale(positionSensor.data[positionSensor.data.length - 2].y));
    });
  }

  /**
   * stop the animation cycle
   */
  ngOnDestroy() {
    this.pollingService.stopPolling();
    this.pollingSubscription.unsubscribe();
  }
}
