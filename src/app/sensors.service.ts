import { Injectable } from '@angular/core';
import {Sensor} from './models/sensor';
import {SENSORS} from './sensor-list/sensors-list';
import {Observable, of} from 'rxjs/index';
import {TunnelNetwork} from './models/tunnel-network';
import {HttpClient} from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import {SensorLocation} from './models/sensor-location';

@Injectable({
  providedIn: 'root'
})
export class SensorsService {

  private tunnelNetUrl = '/api/tunnelNet'; // URL to web API
  private locationURL = '/api/locations';
  constructor(private http: HttpClient) { }

  getLocation(locationId: number): Observable<SensorLocation> {
    const url = `${this.locationURL}/${locationId}/`;
    return this.http.get<SensorLocation>(url).pipe(
      catchError(this.handleError<SensorLocation>(`getSensors at location id=${locationId}`))
    );
  }

  getTunnelNetwork(): Observable<TunnelNetwork> {
    return this.http.get<TunnelNetwork>(this.tunnelNetUrl)
      .pipe(
        catchError(this.handleError('getTunnelNet'))
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
