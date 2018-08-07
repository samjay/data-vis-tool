import { Injectable } from '@angular/core';
import {Observable, of, Subject} from 'rxjs/index';
import {TunnelNetwork} from './models/tunnel-network';
import {HttpClient} from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import {SensorLocation} from './models/sensor-location';
import {tap} from 'rxjs/internal/operators';
import {Sensor} from './models/sensor';

@Injectable({
  providedIn: 'root'
})
export class SensorsService {

  private tunnelNetUrl = '/api/tunnelNet'; // URL to web API
  private locationURL = '/api/locations';
  private sensorURL = '/api/sensorData';
  private sensorListURL = '/api/sensorList';
  private overViewSensorListURL = '/api/overViewSensors';
  private index = 50; // TODO temp index for emulating real time data
  private fromIndex;
  constructor(private http: HttpClient) {}

  /**
   * get sensor location of given id
   * @param {number} locationId
   * @returns {Observable<SensorLocation>}
   */
  getLocation(locationId: number): Observable<SensorLocation> {
    const url = `${this.locationURL}/${locationId}/`;
    return this.http.get<SensorLocation>(url).pipe(
      catchError(this.handleError<SensorLocation>(`getSensors at location id=${locationId}`))
    );
  }

  /**
   * get the tunnel network json
   * @returns {Observable<TunnelNetwork>}
   */
  getTunnelNetwork(): Observable<TunnelNetwork> {
    return this.http.get<TunnelNetwork>(this.tunnelNetUrl)
      .pipe(
        catchError(this.handleError('getTunnelNet'))
      );
  }

  /**
   * get the tunnel network json
   * @returns {Observable<TunnelNetwork>}
   */
  getSensorNetwork(): Observable<any> {
    return this.http.get<any>(this.sensorURL)
      .pipe(
        tap(sensors => {
          this.index++;
          sensors.forEach( sensor => {
            this.updateIndex();
            sensor.data = sensor.data.slice(this.fromIndex, this.index);
          });
        }),
        catchError(this.handleError('getTunnelNet'))
      );
  }

  /**
   * get the sensor data for a sensor
   * @param {string} sensorKey concatenation of location ID and sensor id
   * @returns {Observable<any>}
   */
  getSensorData(sensorKey: string): Observable<any> {
    const url = `${this.sensorURL}/${sensorKey}`;
    return this.http.get<any>(url).pipe(
      tap(sensorObj => {
        this.index++;
        this.updateIndex(); // TODO manual creation of realtime update, remove when it's there
        sensorObj.data = sensorObj.data.slice(this.fromIndex, this.index);
      }),
      catchError(this.handleError<any>(`getSensorsdata from sensor=${sensorKey}`))
    );
  }

  updateIndex() {
    if (this.index > 50) {
      if (this.index > 200) {
        this.index = 50;
        this.fromIndex = 0;
      }
      this.fromIndex =  this.index - 50;
    } else {
      this.fromIndex = 0;
    }
  }

  getOverViewSensors(): Observable<Sensor[]> {
    return this.http.get<Sensor[]>(this.overViewSensorListURL).pipe(
       catchError(this.handleError<Sensor[]>(`get overview sensors`))
    );
  }


  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead
      //
      // // TODO: better job of transforming error for user consumption
      // this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }


}
