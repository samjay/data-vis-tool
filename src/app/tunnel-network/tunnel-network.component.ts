import { Component, OnInit, OnDestroy } from '@angular/core';
import * as d3 from 'd3';
import {TunnelNetwork} from '../models/tunnel-network';
import {Router} from '@angular/router';
import {SensorsService} from '../sensors.service';
import {COLORS, rygColors, sensorColors} from '../models/colors';
import {height, margin, width} from '../common/svg-dimensions';
import {SENSORS} from '../sensor-list/sensors-list';

@Component({
  selector: 'app-tunnel-network',
  templateUrl: './tunnel-network.component.html',
  styleUrls: ['./tunnel-network.component.css']
})
export class TunnelNetworkComponent implements OnInit, OnDestroy {

  tunnelNet: TunnelNetwork;
  sensorSource;
  svgContainer;
  xScale;
  yScale;
  dataOpacityScale;
  dataColorScale;
  minVal;
  maxVal;
  animateID;
  sensorTypes = [SENSORS[0], SENSORS[1], SENSORS[2], SENSORS[8]]; // TODO sensors from service
  selectedSensorType = this.sensorTypes[3];

  constructor(private router: Router,
              private sensorService: SensorsService) { }

  ngOnInit() {
    this.svgContainer = d3.select('#tunnelNetChart').append('svg')
      .attr('width',  width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom).attr('style', 'margin-top 30px');

    this.sensorService.getTunnelNetwork().subscribe(tunnelNetwork => {
      this.tunnelNet = tunnelNetwork;

      this.xScale = d3.scaleLinear()
        .domain([d3.min(this.tunnelNet.locations, (location) => location.x),
          d3.max(this.tunnelNet.locations, (location) => location.x)])
        .range([margin.left, width]);

      this.yScale = d3.scaleLinear()
        .domain([d3.min(this.tunnelNet.locations, (location) => location.y),
          d3.max(this.tunnelNet.locations, (location) => location.y)])
        .range([margin.top, height]);

      this.sensorService.getSensorNetwork().subscribe(sensorNodes => {
        this.sensorSource = sensorNodes;
        this.dataOpacityScale = d3.scaleLinear().domain(this.getDataDomainRange()).range([0, 0.8]);
        this.dataColorScale = d3.scaleQuantize().domain(this.getDataDomainRange()).range(rygColors);
        this.showData();
        this.animate();
        this.draw();
      });
    });
  }

  draw() {

    const lineFunction = d3.line().x(d => this.xScale(d.x)).y(d => this.yScale(d.y)).curve(d3.curveLinear);

    this.svgContainer.selectAll('path').data(this.tunnelNet.tunnels).enter()
      .append('path').attr('d', (d) => lineFunction(d.locations))
      .attr('stroke', (d, i) => COLORS[i])
      .attr('stroke-width', 10).attr('fill', 'none');

    this.svgContainer.selectAll('.locationCircle').data(this.tunnelNet.locations).enter()
      .each((d) => {this.showWarning(d); })
      .append('circle')
      .attr('id', (d) => 'locationCircle' + d.id)
      .attr('cx', (d) => this.xScale(d.x))
      .attr('cy', (d) => this.yScale(d.y))
      .attr('r', 15)
      .attr('fill', 'white').attr('stroke', 'black').attr('stroke-width', 4)
      .on('mouseover', (d, i, elem) => this.showDetails(d, i, elem))
      .on('mouseout', (d, i, elem) => this.hideDetails(d, i, elem))
      .on('click', (d, i) => this.goToSensorLocation(d));
  }


  /**
   * show details on mouseover of location
   * @param d datapoint, instance of sensor-location
   * @param i index
   * @param elem html element
   */
  showDetails(d, i, elem) {
    let locationId;
    if (d.id > 4) {
      locationId = (d.id % 4) + 1;
    } else {
      locationId = d.id;
    }

    const circle = d3.select(elem[i]);
    // Make circle bigger
    circle.transition()
      .duration(500)
      .attr('r', 23);

    // Add background rectangle and animate
    this.svgContainer.append('rect').attr('id', 'r' + d.x + '-' + d.y + '-' + i)
      .attr('x', () => this.xScale(d.x) + 30)
      .attr('y', () => this.yScale(d.y) - 25)
      .attr('width', 1).attr('height', 5)
      .attr('fill', 'darkblue')
      .transition().duration(500)
      .attr('width', 150).attr('height', 40);

    // add text
    this.svgContainer.append('text').attr('id', 't1' + d.x + '-' + d.y + '-' + i)
      .attr('x', () => this.xScale(d.x) + 33)
      .attr('y', () => this.yScale(d.y) - 10)
      .attr('font-size', 15).attr('font-family', 'helvetica').attr('fill', 'white')
      .text('Location: ' + d.id)
      .attr('fill-opacity', 0)
      .transition().delay(200).duration(500)
      .attr('fill-opacity', 1);

    this.svgContainer.append('text').attr('id', 'd' + d.x + '-' + d.y + '-' + i)
      .attr('x', () => this.xScale(d.x) + 33)
      .attr('y', () => this.yScale(d.y) + 10)
      .attr('font-size', 15).attr('font-family', 'helvetica').attr('fill', 'white')
      .text(this.selectedSensorType.name + ': ' + this.getCurrentValueOfSelectedType(locationId))
      .attr('fill-opacity', 0)
      .transition().delay(200).duration(500)
      .attr('fill-opacity', 1);
  }

  /**
   * hide details when mouse out of circle
   * @param d data point
   * @param i index
   * @param elem html element
   */
  hideDetails(d, i, elem) {
    const circle = d3.select(elem[i]);
    circle.transition()
      .duration(100).attr('r', 15);
    d3.select('#t1' + d.x + '-' + d.y + '-' + i).remove();
    d3.select('#t2' + d.x + '-' + d.y + '-' + i).remove();
    d3.select('#d' + d.x + '-' + d.y + '-' + i).remove();
    d3.select('#r' + d.x + '-' + d.y + '-' + i).remove();
  }

  /**
   * Show pulsing circle if status is not ok
   * @param d data point
   */
  showWarning(d) {
    if (!d.status_ok) {
      this.pulse(d);
    }
  }

  /**
   * seperate method because recursive internal function
   * @param d datapoint
   */
  pulse(d) {
      const circle = this.svgContainer.append('circle')
        .attr('cx', () => this.xScale(d.x))
        .attr('cy', () => this.yScale(d.y))
        .attr('r', 1)
        .style('fill', 'red').attr('fill-opacity', 0.8)
        .on('click', () => this.goToSensorLocation(d));
      repeat();
      function repeat() {
        circle
          .transition().duration(1000)
          .attr('r', 30)
          .style('fill', 'red')
          .attr('fill-opacity', 0.4)
          .transition().duration(10)
          .attr('r', 1)
          .attr('fill-opacity', 0.8)
          .on('end', repeat);
      }
  }

  typeSelected() {
    if (this.animateID) {
      window.clearInterval(this.animateID);
    }
    this.pollData();
    this.animate();
  }

  animate() {
    this.animateID = window.setInterval(() => {
      this.pollData();
    }, 3000);
  }

  pollData() {
    this.sensorService.getSensorNetwork().subscribe(sensorNodes => {
      this.sensorSource = sensorNodes;
      this.dataOpacityScale = d3.scaleLinear().domain(this.getDataDomainRange()).range([0, 0.8]);
      this.dataColorScale = d3.scaleQuantize().domain(this.getDataDomainRange()).range(rygColors);
      this.animateData();
    });
  }

  showData() {

    this.svgContainer.selectAll('.dataCircle').data(this.tunnelNet.locations).enter()
      .append('circle')
      .attr('class', 'dataCircle')
      .attr('id', (d) => 'dataCircle' + d.id)
      .attr('cx', (d) => this.xScale(d.x))
      .attr('cy', (d) => this.yScale(d.y))
      .attr('r', 70)
      // Opacity data:
      .style('fill', () => {
        const sensorColorFilter = sensorColors.filter((sC) => sC.type === this.selectedSensorType.id);
        return sensorColorFilter[0].color;
      })
      .attr('stroke-opacity', (d) => this.dataOpacity(d) * 2)
      .attr('fill-opacity', (d) => this.dataOpacity(d))
      .attr('stroke', 'black');
    // Color data:
      // .attr('fill', (d) => {
      //   return this.dataColor(d);
      // })
      // .attr('fill-opacity', 0.4);

  }

  getDataDomainRange() {
    const filterdSensors = this.sensorSource.filter(
      (sensorFilter) => sensorFilter.id.endsWith(this.selectedSensorType.id));
    this.minVal = 1;
    this.maxVal = 1;
    let tempMin;
    let tempMax;
    filterdSensors.forEach((sensor) => {
      tempMin = d3.min(sensor.data, (d) => d.x);
      if (this.minVal) {
        if (tempMin < this.minVal) {
          this.minVal = tempMin;
        }
      } else {
        this.minVal = tempMin;
      }

      tempMax = d3.max(sensor.data, (d) => d.x);
      if (this.maxVal) {
        if (tempMax > this.maxVal) {
          this.maxVal = tempMax;
        }
      } else {
        this.maxVal = tempMax;
      }
    });
    return [this.minVal, this.maxVal];
  }

  animateData() {
    for (let i = 0; i < this.tunnelNet.locations.length; i++) {
      const dataCircle = d3.select('#dataCircle' + this.tunnelNet.locations[i].id);
      dataCircle.
      transition().duration(500)
      // opacity data:
        .style('fill', () => {
          const sensorColorFilter = sensorColors.filter((sC) => sC.type === this.selectedSensorType.id);
          return sensorColorFilter[0].color;
        })
        .attr('stroke-opacity', (d) => this.dataOpacity(d) * 2)
        .attr('fill-opacity', (d) => this.dataOpacity(d));
      // Color data:
        // .attr('fill', (d) => this.dataColor(d));
    }
  }

  dataOpacity(d) {
    let locationId;
    if (d.id > 4) {
      locationId = (d.id % 4) + 1;
    } else {
      locationId = d.id;
    }
    return this.dataOpacityScale(this.getCurrentValueOfSelectedType(locationId));
  }

  getCurrentValueOfSelectedType(locationId) {
    const sensors = this.sensorSource.filter((sensorFilter) =>
      sensorFilter.id === locationId + this.selectedSensorType.id);
    const dataSensor = sensors[0];
    if (dataSensor) {
      // console.log('loc val ' + d.id + ': ' + dataSensor.data[dataSensor.data.length - 1].x);
      return dataSensor.data[dataSensor.data.length - 1].x;
    } else {
      return 0;
    }
  }

  dataColor(d) {
    let locationId;
    if (d.id > 4) {
      locationId = (d.id % 4) + 1;
    } else {
      locationId = d.id;
    }

    return this.dataColorScale(this.getCurrentValueOfSelectedType(locationId));

  }


  /**
   * navigation to the location sensor list component
   * @param d
   */
  goToSensorLocation(d) {
    this.router.navigate(['/location', d.id]);
  }

  ngOnDestroy() {
    if (this.animateID) {
      window.clearInterval(this.animateID);
    }
  }
}
