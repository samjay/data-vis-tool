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
    x: 150, y: 1, z: 0,
    sensor_list: [SENSORS[0], SENSORS[2]],
    status_ok: true
  };
  location3: SensorLocation = { id: 3,
    x: 170, y: 30, z: 0,
    sensor_list: [SENSORS[4], SENSORS[2], SENSORS[0]],
    status_ok: false
  };
  location4: SensorLocation = { id: 4,
    x: 300, y: 30, z: 0,
    sensor_list: [SENSORS[5], SENSORS[2], SENSORS[0]],
    status_ok: true
  };
  location5: SensorLocation = { id: 5,
    x: 120, y: 140, z: 0,
    sensor_list: [SENSORS[6], SENSORS[2], SENSORS[0]],
    status_ok: false
  };
  location6: SensorLocation = { id: 6,
    x: 70, y: 130, z: 0,
    sensor_list: [SENSORS[7], SENSORS[2], SENSORS[0]],
    status_ok: true
  };
  location7: SensorLocation = { id: 7,
    x: 90, y: 140, z: 0,
    sensor_list: [SENSORS[1], SENSORS[2], SENSORS[0]],
    status_ok: true
  };
  location8: SensorLocation = { id: 8,
    x: 250, y: 140, z: 0,
    sensor_list: [SENSORS[4], SENSORS[2], SENSORS[0]],
    status_ok: false
  };
  location9: SensorLocation = { id: 9,
    x: 300, y: 220, z: 0,
    sensor_list: [SENSORS[5], SENSORS[2], SENSORS[0]],
    status_ok: true
  };
  location10: SensorLocation = { id: 10,
    x: 30, y: 220, z: 0,
    sensor_list: [SENSORS[6], SENSORS[2], SENSORS[0]],
    status_ok: false
  };

  tunnel1: Tunnel = { locations: [this.location1, this.location2, this.location3, this.location4]};
  tunnel2: Tunnel = { locations: [this.location1, this.location2, this.location3, this.location5]};
  tunnel3: Tunnel = { locations: [this.location6, this.location7, this.location5, this.location8, this.location9]};
  tunnel4: Tunnel = { locations: [this.location10, this.location5]};

  tunnelNet: TunnelNetwork = {tunnels: [this.tunnel1, this.tunnel2, this.tunnel3, this.tunnel4],
    locations: [this.location1, this.location2, this.location3, this.location4, this.location5,
      this.location6, this.location7, this.location8, this.location9, this.location10]};

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
