import { Component, OnInit, OnDestroy } from '@angular/core';
import * as d3 from 'd3';
import {TunnelNetwork} from '../models/tunnel-network';
import {Router} from '@angular/router';
import {SensorsService} from '../sensors.service';
import {COLORS, rygColors, sensorColors} from '../models/colors';
import {height, margin, svgViewboxHeight, svgViewboxWidth, width} from '../common/svg-dimensions';
import {PollingService} from '../polling.service';
import {NgProgress} from 'ngx-progressbar';
import {ChartService} from '../chart.service';

@Component({
  selector: 'app-tunnel-network',
  templateUrl: './tunnel-network.component.html',
  styleUrls: ['./tunnel-network.component.css']
})
export class TunnelNetworkComponent implements OnInit, OnDestroy {

  tunnelNet: TunnelNetwork; // tunnel network from data
  sensorSource; // sensor data

  // d3
  svgContainer;
  xScale;
  yScale;
  dataOpacityScale; // option1: opacity scale for data circles
  dataColorScale; // option2: color scale for data circles
  dataFrameLengthScale;

  minVal;
  maxVal;
  sensorTypes; // TODO sensors from service
  selectedSensorType;
  pollingSubscription;
  locationCircleRadius = 15;
  dataReady = false;
  legendSvg;

  option1;
  option2;

  constructor(private router: Router,
              private sensorService: SensorsService, private chartService: ChartService,
              private pollingService: PollingService, public ngProgress: NgProgress) { }

  ngOnInit() {
    this.option1 = true;
    this.option2 = false;
    this.svgContainer = d3.select('#tunnelNetChart').append('svg');
    this.chartService.svgDimensionInit(this.svgContainer, svgViewboxWidth, svgViewboxHeight);

    this.ngProgress.start();
    this.sensorService.getTunnelNetwork().subscribe(tunnelNetwork => {
      this.tunnelNet = tunnelNetwork;

      this.xScale = d3.scaleLinear()
        .domain([d3.min(this.tunnelNet.locations, (location) => location.x),
          d3.max(this.tunnelNet.locations, (location) => location.x)])
        .range([margin.left + 50 , width]);

      this.yScale = d3.scaleLinear()
        .domain([d3.min(this.tunnelNet.locations, (location) => location.y),
          d3.max(this.tunnelNet.locations, (location) => location.y)])
        .range([margin.top + margin.bottom, height]);

      this.pollingSubscription = this.pollingService.pollingItem.subscribe(() => this.pollData());

      this.sensorService.getOverViewSensors().subscribe(sensorsList => {
        this.sensorTypes = sensorsList;
        this.selectedSensorType = this.sensorTypes[2];
        this.sensorService.getSensorNetwork().subscribe(sensorNodes => {
          this.sensorSource = sensorNodes;
          this.dataOpacityScale = d3.scaleLinear().domain(this.getDataDomainRange()).range([0, 0.8]);
          this.dataColorScale = d3.scaleQuantize().domain(this.getDataDomainRange()).range(rygColors);
          this.dataFrameLengthScale = d3.scaleLinear().domain(this.getDataDomainRange()).range([0, 100]);
          this.dataReady = true;
          this.pollingService.startPolling();
          this.showData();
          this.draw();
          this.ngProgress.done();
        });
      });
    });
  }

  switchOptions(num) {
    for (let i = 0; i < this.tunnelNet.locations.length; i++) {
      d3.select('#dataCircle' + this.tunnelNet.locations[i].id).remove();
      d3.select('#dataFrame').remove();
      d3.select('#dataRect' + this.tunnelNet.locations[i].id).remove();
    }

    if (num === 1) {
      this.option1 = true;
      this.option2 = false;
      if (this.svgContainer) {
        this.svgContainer.remove();
      }
      this.svgContainer = d3.select('#tunnelNetChart').append('svg');
      this.chartService.svgDimensionInit(this.svgContainer, svgViewboxWidth, svgViewboxHeight);
      this.showData();
      this.draw();
    } else {
      this.option1 = false;
      this.option2 = true;
      this.showData();
    }
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
      .attr('r', this.locationCircleRadius)
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
    const toolTipRect = {padding: {x: 30, y: 25}, pre: { width: 1, height: 5}, post: {width: 150, height: 40}};
    const toolTipText = {padding: {x: 33, y: 10}};
    const animationDuration = 500;
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
      .attr('x', () => this.xScale(d.x) + toolTipRect.padding.x)
      .attr('y', () => this.yScale(d.y) - toolTipRect.padding.y)
      .attr('width', toolTipRect.pre.width).attr('height', toolTipRect.post.height)
      .attr('fill', 'darkblue')
      .transition().duration(animationDuration)
      .attr('width', toolTipRect.post.width).attr('height', toolTipRect.post.height);

    // add text
    this.svgContainer.append('text').attr('id', 't1' + d.x + '-' + d.y + '-' + i)
      .attr('x', () => this.xScale(d.x) + toolTipText.padding.x)
      .attr('y', () => this.yScale(d.y) - toolTipText.padding.y)
      .attr('font-size', 15).attr('font-family', 'helvetica').attr('fill', 'white')
      .text('Location: ' + d.id)
      .attr('fill-opacity', 0.1)
      .transition().delay(200).duration(animationDuration)
      .attr('fill-opacity', 1);

    this.svgContainer.append('text').attr('id', 'd' + d.x + '-' + d.y + '-' + i)
      .attr('x', () => this.xScale(d.x) + toolTipText.padding.x)
      .attr('y', () => this.yScale(d.y) - toolTipText.padding.y + 20)
      .attr('font-size', 15).attr('font-family', 'helvetica').attr('fill', 'white')
      .text(this.selectedSensorType.name + ': ' + this.getCurrentValueOfSelectedType(locationId))
      .attr('fill-opacity', 0.1)
      .transition().delay(200).duration(animationDuration)
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
      .duration(100).attr('r', this.locationCircleRadius);
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
    this.pollData();
  }

  pollData() {
    this.sensorService.getSensorNetwork().subscribe(sensorNodes => {
      this.sensorSource = sensorNodes;
      this.dataOpacityScale = d3.scaleLinear().domain(this.getDataDomainRange()).range([0, 0.8]);
      this.dataColorScale = d3.scaleQuantize().domain(this.getDataDomainRange()).range(rygColors);
      this.dataFrameLengthScale = d3.scaleLinear().domain(this.getDataDomainRange()).range([0, 100]);
      this.animateData();
    });
  }

  showData() {
    if (this.option1) {
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
    } else if (this.option2) {
      this.svgContainer.selectAll('.dataFrameRect').data(this.tunnelNet.locations).enter()
        .append('rect')
        .attr('id', 'dataFrame')
        .attr('x', (d) => this.xScale(d.x) - 50)
        .attr('y', (d) => this.yScale(d.y) + 30)
        .attr('width', 100)
        .attr('height', 20)
        .attr('stroke', 'blue')
        .attr('stroke-width', 0.4)
        .attr('fill-opacity', 0.4)
        .attr('fill', 'white');

      this.svgContainer.selectAll('.dataRect').data(this.tunnelNet.locations).enter()
        .append('rect')
        .attr('id', (d) => 'dataRect' + d.id)
        .attr('x', (d) => this.xScale(d.x) - 50)
        .attr('y', (d) => this.yScale(d.y) + 30)
        .attr('width', (d) => this.dataFrameLength(d))
        .attr('height', 20)
        .attr('fill', () => {
          const sensorColorFilter = sensorColors.filter((sC) => sC.type === this.selectedSensorType.id);
          return sensorColorFilter[0].hardColor;
        });
      this.updateLegend();
    }
  }

  updateLegend() {
    if (this.legendSvg) {
      this.legendSvg.remove();
    }
    this.legendSvg = d3.select('#frameRectlegend').append('svg').attr('width', 300)
      .attr('height', 300);
    this.legendSvg.append('rect')
      .attr('x', 10)
      .attr('y', 10)
      .attr('width', 100)
      .attr('height', 20)
      .attr('stroke', 'blue')
      .attr('stroke-width', 0.4)
      .attr('fill-opacity', 0.4)
      .attr('fill', 'white');

    // Add grid
    this.legendSvg.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(' + 10  + ', ' + 32 + ')')
      .call(d3.axisBottom(this.dataFrameLengthScale).ticks(3));

  }

  /**
   * Dynamically find the domain range for given data
   * @returns {[number , number]}
   */
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
    const animationDuration = 500;
    for (let i = 0; i < this.tunnelNet.locations.length; i++) {
      if (this.option1) {
        const dataCircle = d3.select('#dataCircle' + this.tunnelNet.locations[i].id);
        dataCircle.
        transition().duration(animationDuration)
        // opacity data:
          .style('fill', () => {
            const sensorColorFilter = sensorColors.filter((sC) => sC.type === this.selectedSensorType.id);
            return sensorColorFilter[0].color;
          })
          .attr('stroke-opacity', (d) => this.dataOpacity(d) * 2)
          .attr('fill-opacity', (d) => this.dataOpacity(d));
        // Color data:
          // .attr('fill', (d) => this.dataColor(d));
      } else if (this.option2) {
        const dataRect = d3.select('#dataRect' + this.tunnelNet.locations[i].id);
        dataRect
          .transition().duration(animationDuration)
          .attr('width', (d) => this.dataFrameLength(d))
          .attr('fill', () => {
            const sensorColorFilter = sensorColors.filter((sC) => sC.type === this.selectedSensorType.id);
            return sensorColorFilter[0].hardColor;
          });
      }
    }
    if (this.option2) {
      this.updateLegend();
    }
  }

  dataOpacity(d) {
    let locationId;
    if (d.id > 4) { // TODO location temp adjustment
      locationId = (d.id % 4) + 1;
    } else {
      locationId = d.id;
    }
    return this.dataOpacityScale(this.getCurrentValueOfSelectedType(locationId));
  }

  dataFrameLength(d) {
    let locationId;
    if (d.id > 4) { // TODO location temp adjustment
      locationId = (d.id % 4) + 1;
    } else {
      locationId = d.id;
    }
    const length = this.dataFrameLengthScale(this.getCurrentValueOfSelectedType(locationId));
    if (length < 0) {
      return 0;
    } else {
      return length;
    }
  }

  getCurrentValueOfSelectedType(locationId) {
    const sensors = this.sensorSource.filter((sensorFilter) =>
      sensorFilter.id === locationId + this.selectedSensorType.id);
    const dataSensor = sensors[0];
    if (dataSensor) {
      if (dataSensor.data[dataSensor.data.length - 1].x) {
        return dataSensor.data[dataSensor.data.length - 1].x;
      } else {
        return this.minVal;
      }
    } else {
      return this.minVal;
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
    this.pollingService.stopPolling();
    this.pollingSubscription.unsubscribe();
  }
}
