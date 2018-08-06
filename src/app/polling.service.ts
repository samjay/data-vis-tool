import { Injectable } from '@angular/core';
import {Subject, Subscription} from 'rxjs/index';

@Injectable({
  providedIn: 'root'
})
export class PollingService {

  private pollingId;
  private pollingSubject = new Subject<number>();
  pollingItem = this.pollingSubject.asObservable();
  private started;

  constructor() { }

  public startPolling() {
    this.pollingSubject.subscribe();
    if (!this.started) {
      this.started = true;
      this.pollingId = window.setInterval(() => {
        this.pollData();
      }, 4000);
    }
  }

  public pollData() {
    this.pollingSubject.next();
  }

  public stopPolling() {
    if (this.pollingId) {
      this.started = false;
      window.clearInterval(this.pollingId);
    }
  }
}
