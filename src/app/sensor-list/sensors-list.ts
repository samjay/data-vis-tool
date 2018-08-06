import { Sensor } from '../models/sensor';
import { CHARTS } from '../chart/chart-list';

export const SENSORS: Sensor[] = [
  {id: 'A', name: 'Temperature', chart: CHARTS[1], status_ok: true, unit: '°celsius'},
  {id: 'B', name: 'Humidity', chart: CHARTS[1], status_ok: true, unit: '%' },
  {id: 'C', name: 'Pressure', chart: CHARTS[1], status_ok: true, unit: 'Pa'},
  {id: 'D', name: 'Position', chart: CHARTS[2], status_ok: true, unit: ''},
  {id: 'E', name: 'Gyroscope', chart: CHARTS[2], status_ok: true, unit: '' },
  {id: 'F', name: 'GPS', chart: CHARTS[2], status_ok: true, unit: ''},
  {id: 'G', name: 'Battery', chart: CHARTS[1], status_ok: true, unit: '%'},
  {id: 'H', name: 'Signal', chart: CHARTS[1], status_ok: true, unit: '%' },
  {id: 'I', name: 'People', chart: CHARTS[2], status_ok: true, unit: 'number' },
  {id: 'J', name: 'Accelorometer', chart: CHARTS[2], status_ok: true, unit: '' }
];
