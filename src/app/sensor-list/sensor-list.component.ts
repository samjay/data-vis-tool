import { Component, OnInit } from '@angular/core';
import { Sensor } from '../models/sensor';
import { SensorsService } from '../sensors.service';
import {Router} from '@angular/router';
import {Chart} from '../models/chart';
import {CHARTS} from '../chart/chart-list';

@Component({
  selector: 'app-sensor-list',
  templateUrl: './sensor-list.component.html',
  styleUrls: ['./sensor-list.component.css']
})
export class SensorListComponent implements OnInit {

  sensors: Sensor[];
  selectedSensor: Sensor;
  chart: Chart;
  constructor(private sensorService: SensorsService, private router: Router) { }

  ngOnInit() {
    this.getSensors();
  }

  showChart(sensor: Sensor) {
    // this.router.navigate(['chart/' + sensor.id]);
    this.selectedSensor = sensor;
    this.setChart();
  }

  getSensors(): void {
    this.sensorService.getSensors().subscribe( sensors => this.sensors = sensors);
  }

  setChart() {
      this.chart = CHARTS.find(chart => chart.id === this.selectedSensor.id);
  }
}
