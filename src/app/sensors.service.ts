import { Injectable } from '@angular/core';
import {Sensor} from './models/sensor';
import {SENSORS} from './sensor-list/sensors-list';
import {Observable, of} from 'rxjs/index';
import {SensorLocation} from './models/sensor-location';
import {Tunnel} from './models/tunnel';
import {TunnelNetwork} from './models/tunnel-network';

@Injectable({
  providedIn: 'root'
})
export class SensorsService {

  location1: SensorLocation = { id: 1,
    x: 1, y: 1, z: 0,
    sensor_list: [SENSORS[0], SENSORS[1]],
    status_ok: true
  };
  location2: SensorLocation = { id: 2,
    x: 300, y: 1, z: 0,
    sensor_list: [SENSORS[0], SENSORS[2]],
    status_ok: true
  };
  location3: SensorLocation = { id: 3,
    x: 300, y: 300, z: 0,
    sensor_list: [SENSORS[1], SENSORS[2], SENSORS[0]],
    status_ok: false
  };
  location4: SensorLocation = { id: 4,
    x: 1, y: 300, z: 0,
    sensor_list: [SENSORS[1], SENSORS[2], SENSORS[0]],
    status_ok: true
  };
  location5: SensorLocation = { id: 5,
    x: 150, y: 200, z: 0,
    sensor_list: [SENSORS[1], SENSORS[2], SENSORS[0]],
    status_ok: false
  };

  tunnel1: Tunnel = { locations: [this.location1, this.location2, this.location3]};
  tunnel2: Tunnel = { locations: [this.location1, this.location4, this.location3]};
  tunnel3: Tunnel = { locations: [this.location1, this.location5, this.location3]};

  tunnelNet: TunnelNetwork = {tunnels: [this.tunnel1, this.tunnel2, this.tunnel3],
    locations: [this.location1, this.location2, this.location3, this.location4, this.location5]};

  constructor() { }

  getSensors(locationId: number): Observable<Sensor[]> {
    return of(this.tunnelNet.locations.find(location => location.id === locationId).sensor_list);
  }

  getSensor(id: number): Observable<Sensor> {
    return of(SENSORS.find(sensor => sensor.id === id));
  }

  getTunnerlNetwork(): Observable<TunnelNetwork> {
    return of(this.tunnelNet);
  }
}
