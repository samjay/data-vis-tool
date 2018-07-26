import {Component, OnDestroy, OnInit} from '@angular/core';
import * as d3 from 'd3';
import { margin } from '../common/svg-dimensions';
import {SensorsService} from '../sensors.service';

@Component({
  selector: 'app-sensor-movement',
  templateUrl: './sensor-movement.component.html',
  styleUrls: ['./sensor-movement.component.css']
})
export class SensorMovementComponent implements OnInit, OnDestroy {

  svgContainer;
  /*
  sensor data array from source
   */
  sensorSource;
  /*
  filtered position data
   */
  positionData;
  /*
  filtered accelorometer data
   */
  accelerometerData;
  /*
  unique id to create and destroy the animating thread
   */
  animateId;

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

  constructor(private sensorService: SensorsService) { }

  ngOnInit() {

    // TODO domain min and max
    this.xScale = d3.scaleLinear().domain([0, 500]).range([margin.left, this.width - margin.right]);
    this.yScale = d3.scaleLinear().domain([0, 500]).range([margin.top, this.height - margin.bottom]);
    // accelerometer values range from -16 to 16.
    this.lineLengthScale = d3.scaleLinear().domain([-16, 16]).range([-100, 100]);

    this.sensorService.getSensorNetwork().subscribe(sensorNodes => {
        this.sensorSource = sensorNodes;
        this.prepare();
        this.draw();
        this.animate();
    });
  }

  /**
   * filter the position and accelerometer sensors from the sensor network.
   * sensor ids end with D and J respectively
   */
  prepare() {
    this.positionData = this.sensorSource.filter(sensorFilter => sensorFilter.id.endsWith('D'));
    this.accelerometerData = this.sensorSource.filter(sensorFilter => sensorFilter.id.endsWith('J'));
  }

  draw() {
    if (this.svgContainer) {
      this.svgContainer.remove();
    }

    this.svgContainer = d3.select('#sensorPosChart').append('svg').attr('width', this.width)
      .attr('height', this.height).style('border', '1px solid black');

    // Add grid
    const latitudeScale = d3.scaleLinear().domain([0, 100]).range([0, this.width]);
    const longitudeScale = d3.scaleLinear().domain([0, 100]).range([0, this.height]);
    this.svgContainer.append('g')
      .attr('class', 'grid')
      .attr('transform', 'translate(' + 0 + ', 0)')
      .call(d3.axisTop(latitudeScale)
        .tickSize( - this.height , 0, 0)
      );
    this.svgContainer.append('g')
      .attr('class', 'grid')
      .attr('transform', 'translate(' + 0 + ', 0)')
      .call(d3.axisLeft(longitudeScale)
        .tickSize( - this.width , 0, 0)
      );

    // add position circles
    this.svgContainer.selectAll('circle').data(this.positionData).enter()
      .append('circle')
      .attr('id', (d) => 'sensorPosCircle' + d.id)
      .attr('cx', (d) => {
        return this.xScale(d.data[d.data.length - 2].x); // TODO getting the last second value for this, fix
      })
      .attr('cy', (d) => this.yScale(d.data[d.data.length - 2].y))
      .attr('r', 20)
      .attr('fill', 'white')
      .attr('stroke', 'black')
      .attr('stroke-width', '3');

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
      .attr('stroke-width', 2)
      .attr('stroke', 'blue');

  }

  /**
   * start the animation cycle
   */
  animate() {
    this.animateId = window.setInterval(() => {
      this.pollData();
    }, 3000);
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
    this.positionData.forEach((positionSensor) => {
      const circle = d3.select('#sensorPosCircle' + positionSensor.id);
      circle.transition().duration(1000)
        .attr('cx', () => {
          return this.xScale(positionSensor.data[positionSensor.data.length - 2].x);
        })
        .attr('cy', () => this.yScale(positionSensor.data[positionSensor.data.length - 2].y));

      const line = d3.select('#sensorAccLine' + positionSensor.id);
      line.transition().duration(1000)
        .attr('x1', () => {
          return this.xScale(positionSensor.data[positionSensor.data.length - 2].x);
        })
        .attr('y1', () => this.yScale(positionSensor.data[positionSensor.data.length - 2].y))
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
    });
  }

  /**
   * stop the animation cycle
   */
  ngOnDestroy() {
    if (this.animateId) {
      window.clearInterval(this.animateId);
    }
  }
}
