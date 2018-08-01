import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {Subject} from 'rxjs/index';

@Injectable()
export class DateFilterService {

  private lowerDateSubject = new Subject<Date>();
  lowerDate = this.lowerDateSubject.asObservable();
  private upperDateSubject = new Subject<Date>();
  upperDate = this.upperDateSubject.asObservable();

  constructor() { }

  setLowerDate(date: Date) {
    this.lowerDateSubject.next(date);
  }

  setUpperDate(date: Date) {
    this.upperDateSubject.next(date);
  }

  // getLowerDate(): Observable<Date> {
  //   return of(this.lowerDate);
  // }

  // getUpperDate(): Observable<Date> {
  //   return of(this.upperDate);
  // }

}
