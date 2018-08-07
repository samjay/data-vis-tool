import {Chart} from './chart';

export class Sensor {
  id: string;
  name: string;
  chart: Chart;
  status_ok: boolean;
  unit: string;
  range: {min: number, max: number};
}
