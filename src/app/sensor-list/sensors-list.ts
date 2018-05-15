import { Sensor } from '../models/sensor';
import {CHARTS} from '../chart/chart-list';

export const SENSORS: Sensor[] = [
  {id: 1, name: 'Heat', chart: CHARTS[0]},
  {id: 2, name: 'Pressure', chart: CHARTS[1] },
  {id: 3, name: 'People', chart: CHARTS[2]},
  {id: 4, name: 'Seismic', chart: CHARTS[3]}
];
