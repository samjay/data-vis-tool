import { Component, OnInit} from '@angular/core';
import { Sensor } from '../models/sensor';
import { SensorsService } from '../sensors.service';
import {Chart} from '../models/chart';
import {DataFileService} from '../data-file.service';
import {ActivatedRoute} from '@angular/router';
import { Location } from '@angular/common';

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
              private dataFileService: DataFileService,
              private route: ActivatedRoute,
              private location: Location) { }

  ngOnInit() {
    this.getSensors(+ this.route.snapshot.paramMap.get('id'));
    this.dataFileService.readFileData();
  }

  showChart(sensor: Sensor) {
    this.selectedSensor = sensor;
    this.chart = this.selectedSensor.chart;
  }

  getSensors(id: number): void {
    this.sensorService.getSensors(id).subscribe( sensors => this.sensors = sensors);
  }

  goBack(): void {
    this.location.back();
  }
}
