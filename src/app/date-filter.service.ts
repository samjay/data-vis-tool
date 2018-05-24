import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable()
export class DateFilterService {

  lowerDate: Date;
  upperDate: Date;

  constructor() { }

  setLowerDate(date: Date) {
    this.lowerDate = date;
  }

  setUpperDate(date: Date) {
    this.upperDate = date;
  }

  getLowerDate(): Observable<Date> {
    return of(this.lowerDate);
  }

  getUpperDate(): Observable<Date> {
    return of(this.upperDate);
  }

}
