import { Sensor } from '../models/sensor';
import { CHARTS } from '../chart/chart-list';

export const SENSORS: Sensor[] = [
  {id: 'A', name: 'Temperature', chart: CHARTS[1], status_ok: true, unit: '°C', range: {min: -15, max: 50}},
  {id: 'B', name: 'Humidity', chart: CHARTS[1], status_ok: true, unit: '%' , range: {min: 0, max: 100}},
  {id: 'C', name: 'Pressure', chart: CHARTS[1], status_ok: true, unit: 'kPa', range: {min: 90, max: 120}},
  {id: 'D', name: 'Position', chart: CHARTS[2], status_ok: true, unit: '', range: {min: 0, max: 1000}},
  {id: 'E', name: 'Gyroscope', chart: CHARTS[2], status_ok: true, unit: '', range: {min: 0, max: 100} },
  {id: 'F', name: 'GPS', chart: CHARTS[2], status_ok: true, unit: '', range: {min: 0, max: 1000}},
  {id: 'G', name: 'Battery', chart: CHARTS[1], status_ok: true, unit: '%', range: {min: 0, max: 100}},
  {id: 'H', name: 'Signal', chart: CHARTS[1], status_ok: true, unit: '%' , range: {min: 0, max: 100}},
  {id: 'I', name: 'People', chart: CHARTS[2], status_ok: true, unit: 'number' , range: {min: 0, max: 15}},
  {id: 'J', name: 'Accelorometer', chart: CHARTS[2], status_ok: true, unit: '', range: {min: -16, max: 16} }
];
