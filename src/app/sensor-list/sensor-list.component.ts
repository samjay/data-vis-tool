import { Component, OnInit} from '@angular/core';
import { Sensor } from '../models/sensor';
import { SensorsService } from '../sensors.service';
import {Chart} from '../models/chart';
import {DataFileService} from '../data-file.service';
import {ActivatedRoute} from '@angular/router';
import {SensorLocation} from '../models/sensor-location';
import {NgProgress} from 'ngx-progressbar';

@Component({
  selector: 'app-sensor-list',
  templateUrl: './sensor-list.component.html',
  styleUrls: ['./sensor-list.component.css']
})
export class SensorListComponent implements OnInit {

  sensors: Sensor[];
  location: SensorLocation;
  selectedSensor: Sensor;
  chart: Chart;
  constructor(private sensorService: SensorsService,
              private route: ActivatedRoute,
              public ngProgress: NgProgress) { }

  ngOnInit() {
    this.getSensors(+ this.route.snapshot.paramMap.get('id'));
  }

  /**
   * show the relevant chart component according to the selected sensor
   * @param {Sensor} sensor
   */
  showChart(sensor: Sensor) {
    this.selectedSensor = sensor;
    this.chart = this.selectedSensor.chart;
  }

  /**
   * load the list of sensors for this location
   * @param {number} id
   */
  getSensors(id: number): void {
    this.ngProgress.start();
    this.sensorService.getLocation(id).subscribe(location => {
      this.location = location;
      this.sensors = location.sensor_list;
      this.ngProgress.done();
    });
  }

}
