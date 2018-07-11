import { Sensor } from '../models/sensor';
import { CHARTS } from '../chart/chart-list';

export const SENSORS: Sensor[] = [
  {id: 'A', name: 'Temperature', chart: CHARTS[1], status_ok: true},
  {id: 'B', name: 'Humidity', chart: CHARTS[1], status_ok: true },
  {id: 'C', name: 'Pressure', chart: CHARTS[1], status_ok: true},
  {id: 'D', name: 'Accelerometer', chart: CHARTS[2], status_ok: true},
  {id: 'E', name: 'Gyroscope', chart: CHARTS[2], status_ok: true },
  {id: 'F', name: 'GPS', chart: CHARTS[2], status_ok: true },
  {id: 'G', name: 'Battery', chart: CHARTS[1], status_ok: true },
  {id: 'H', name: 'Signal', chart: CHARTS[1], status_ok: true },
  {id: 'I', name: 'People', chart: CHARTS[2], status_ok: true }
];
