import { Sensor } from '../models/sensor';
import {CHARTS} from '../chart/chart-list';

export const SENSORS: Sensor[] = [
  {id: 1, name: 'Heat', chart: CHARTS[0], data_key: 'SNSR1', status_ok: true},
  {id: 2, name: 'Pressure', chart: CHARTS[1], data_key: 'SNSR2', status_ok: true },
  {id: 3, name: 'People', chart: CHARTS[2], data_key: 'SNSR3', status_ok: true},
  {id: 4, name: 'Seismic', chart: CHARTS[3], data_key: 'SNSR4', status_ok: true}
];
