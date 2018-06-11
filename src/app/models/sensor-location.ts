import { Sensor } from './sensor';

export class SensorLocation {
  id: number;
  x: number;
  y: number;
  z: number;
  sensor_list: Sensor[];
  status_ok: boolean;
}
