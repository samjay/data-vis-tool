import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import * as d3 from 'd3';

@Injectable({
  providedIn: 'root'
})
export class DataFileService {

  readData;
  lastRead: Date;

  constructor() { }

  /**
   * Read the concentration csv file
   */
  readFileData() {
    d3.csv('assets/Concentration - Weekly.csv').then((data) => {
      this.readData = data;
      this.lastRead = new Date();
    });
  }

  /**
   * load the read data
   * @returns {Observable<any[]>}
   */
  getReadData(): Observable<any[]> {
    if (!this.readData) {
      this.readFileData();
      return of(this.readData);
    } else {
      return of(this.readData);
    }
  }

  getLastRead(): Observable<Date> {
    return of(this.lastRead);
  }

  clear() {
    this.readData = [];
  }
}
