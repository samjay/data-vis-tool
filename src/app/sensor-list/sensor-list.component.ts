import { Component, OnInit } from '@angular/core';
import { Sensor } from '../models/sensor';
import { SensorsService } from '../sensors.service';
import {Chart} from '../models/chart';
import {DataFileService} from '../data-file.service';

@Component({
  selector: 'app-sensor-list',
  templateUrl: './sensor-list.component.html',
  styleUrls: ['./sensor-list.component.css']
})
export class SensorListComponent implements OnInit {

  sensors: Sensor[];
  selectedSensor: Sensor;
  chart: Chart;
  constructor(private sensorService: SensorsService,
              private dataFileService: DataFileService) { }

  ngOnInit() {
    this.getSensors();
    this.dataFileService.readFileData();
  }

  showChart(sensor: Sensor) {
    // this.router.navigate(['chart/' + sensor.id]);
    this.selectedSensor = sensor;
    this.chart = this.selectedSensor.chart;
  }

  getSensors(): void {
    this.sensorService.getSensors().subscribe( sensors => this.sensors = sensors);
  }

}
