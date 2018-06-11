import {Chart} from './chart';

export class Sensor {
  id: number;
  name: string;
  chart: Chart;
  data_key: string;
  status_ok: boolean;
}
