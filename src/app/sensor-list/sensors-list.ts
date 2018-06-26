import { Sensor } from '../models/sensor';
import {CHARTS} from '../chart/chart-list';

export const SENSORS: Sensor[] = [
  {id: 1, name: 'Heat', chart: CHARTS[0], data_key: 'BBE401', status_ok: true},
  {id: 2, name: 'Pressure', chart: CHARTS[1], data_key: 'BBE401', status_ok: true },
  {id: 3, name: 'Humidity', chart: CHARTS[2], data_key: 'SNSR3', status_ok: true},
  {id: 4, name: 'Seismic', chart: CHARTS[3], data_key: 'SNSR4', status_ok: true},
  {id: 5, name: 'Pressure', chart: CHARTS[1], data_key: 'HWF187', status_ok: true },
  {id: 6, name: 'Pressure', chart: CHARTS[1], data_key: 'CTH110', status_ok: true },
  {id: 7, name: 'Pressure', chart: CHARTS[1], data_key: 'KNZ184', status_ok: true },
  {id: 8, name: 'Pressure', chart: CHARTS[1], data_key: 'PIN414', status_ok: true },
];
