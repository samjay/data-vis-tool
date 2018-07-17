import { Injectable } from '@angular/core';
import {Observable, of} from 'rxjs/index';
import {TunnelNetwork} from './models/tunnel-network';
import {HttpClient} from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import {SensorLocation} from './models/sensor-location';
import {tap} from 'rxjs/internal/operators';
import index from '@angular/cli/lib/cli';
import {forEach} from '@angular/router/src/utils/collection';

@Injectable({
  providedIn: 'root'
})
export class SensorsService {

  private tunnelNetUrl = '/api/tunnelNet'; // URL to web API
  private locationURL = '/api/locations';
  private sensorURL = '/api/sensorData';
  private index = 50; // TODO temp index for emulating real time data


  constructor(private http: HttpClient) { }

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
            let fromIndex;
            if (this.index > 50) {
              if (this.index > 200) {
                this.index = 50;
                fromIndex = 0;
              }
              fromIndex =  this.index - 50;
            } else {
              fromIndex = 0;
            }
            sensor.data = sensor.data.slice(fromIndex, this.index);
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
        let fromIndex;
        if (this.index > 50) {
          if (this.index > 200) {
            this.index = 50;
            fromIndex = 0;
          }
          fromIndex =  this.index - 50;
        } else {
          fromIndex = 0;
        }
        sensorObj.data = sensorObj.data.slice(fromIndex, this.index);
      }),
      catchError(this.handleError<any>(`getSensorsdata from sensor=${sensorKey}`))
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
