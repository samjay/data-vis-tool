import { Injectable } from '@angular/core';
import {Sensor} from './models/sensor';
import {SENSORS} from './sensor-list/sensors-list';
import {Observable} from 'rxjs/index';
import {of} from 'rxjs/index';

@Injectable({
  providedIn: 'root'
})
export class SensorsService {

  constructor() { }

  getSensors(): Observable<Sensor[]> {
    return of(SENSORS);
  }

  getSensor(id: number): Observable<Sensor> {
    return of(SENSORS.find(sensor => sensor.id === id));
  }
}
