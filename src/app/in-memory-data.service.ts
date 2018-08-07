import {InMemoryDbService} from 'angular-in-memory-web-api';
import {SensorLocation} from './models/sensor-location';
import {SENSORS} from './sensor-list/sensors-list';
import {Tunnel} from './models/tunnel';
import {TunnelNetwork} from './models/tunnel-network';
import * as d3 from 'd3';
import {Sensor} from './models/sensor';
import {CHARTS} from './chart/chart-list';

export class InMemoryDataService implements InMemoryDbService {
  csvFileData = [];
  sensordataList = [];
  createDb() {
    d3.csv('assets/Concentration - Weekly.csv').then((data) => {
      this.csvFileData = data;
      this.createSensorData();
    });

    const locations: SensorLocation[] = [
      { id: 1,
        x: 1, y: 1, z: 0,
        sensor_list: [SENSORS[0], SENSORS[1]],
        status_ok: true
      },
      { id: 2,
        x: 170, y: 30, z: 0,
        sensor_list: [SENSORS[1], SENSORS[2], SENSORS[6]],
        status_ok: false
      },
      { id: 3,
        x: 300, y: 30, z: 0,
        sensor_list: [SENSORS[0], SENSORS[2], SENSORS[4]],
        status_ok: true
      },
      { id: 4,
        x: 120, y: 140, z: 0,
        sensor_list: [SENSORS[6], SENSORS[1], SENSORS[2]],
        status_ok: false
      },
      { id: 5,
        x: 70, y: 130, z: 0,
        sensor_list: [SENSORS[0], SENSORS[2], SENSORS[4]],
        status_ok: true
      },
      { id: 6,
        x: 250, y: 140, z: 0,
        sensor_list: [SENSORS[0], SENSORS[2], SENSORS[1]],
        status_ok: false
      },
      { id: 7,
        x: 300, y: 220, z: 0,
        sensor_list: [SENSORS[6], SENSORS[2], SENSORS[0]],
        status_ok: true
      },
      { id: 8,
        x: 30, y: 220, z: 0,
        sensor_list: [SENSORS[0], SENSORS[6], SENSORS[4]],
        status_ok: false
      }
    ];

    const tunnel1: Tunnel = { locations: [locations[0], locations[1], locations[2]]};
    const tunnel2: Tunnel = { locations: [locations[0], locations[1], locations[3]]};
    const tunnel3: Tunnel = { locations: [locations[4], locations[3], locations[5], locations[6]]};
    const tunnel4: Tunnel = { locations: [locations[7], locations[3]]};
    const SENSORSLIST: Sensor[] = [
      {id: 'A', name: 'Temperature', chart: CHARTS[1], status_ok: true, unit: '°celsius', range: {min: -15, max: 50}},
      {id: 'B', name: 'Humidity', chart: CHARTS[1], status_ok: true, unit: '%' , range: {min: 1, max: 100}},
      {id: 'C', name: 'Pressure', chart: CHARTS[1], status_ok: true, unit: 'Pa', range: {min: 90000, max: 120000}},
      {id: 'D', name: 'Position', chart: CHARTS[2], status_ok: true, unit: '', range: {min: 0, max: 1000}},
      {id: 'E', name: 'Gyroscope', chart: CHARTS[2], status_ok: true, unit: '', range: {min: 0, max: 100} },
      {id: 'F', name: 'GPS', chart: CHARTS[2], status_ok: true, unit: '', range: {min: 0, max: 1000}},
      {id: 'G', name: 'Battery', chart: CHARTS[1], status_ok: true, unit: '%', range: {min: 0, max: 100}},
      {id: 'H', name: 'Signal', chart: CHARTS[1], status_ok: true, unit: '%' , range: {min: 0, max: 100}},
      {id: 'I', name: 'People', chart: CHARTS[2], status_ok: true, unit: 'number' , range: {min: 0, max: 15}},
      {id: 'J', name: 'Accelorometer', chart: CHARTS[2], status_ok: true, unit: '', range: {min: -16, max: 16} }
    ];
    const overViewSensors = [SENSORSLIST[0], SENSORSLIST[1], SENSORSLIST[2], SENSORSLIST[8]];

    const tunnelNet: TunnelNetwork = {tunnels: [tunnel1, tunnel2, tunnel3, tunnel4],
      locations: locations};

    return {'tunnelNet': tunnelNet, 'locations': tunnelNet.locations,
      'sensorData': this.sensordataList, 'sensorList': SENSORSLIST, 'overViewSensors': overViewSensors};
  }

  createSensorData() {
    const sensor1tempData = [];
    const sensor1humData = [];
    const sensor1presData = [];
    const sensor1btrData = [];
    const sensor1posData = [];
    const sensor1gyroData = [];
    const sensor1accData = [];
    const sensor1signalData = [];
    const sensor1pplData = [];

    const sensor2tempData = [];
    const sensor2humData = [];
    const sensor2presData = [];
    const sensor2btrData = [];
    const sensor2posData = [];
    const sensor2gyroData = [];
    const sensor2accData = [];
    const sensor2signalData = [];
    const sensor2pplData = [];

    const sensor3tempData = [];
    const sensor3humData = [];
    const sensor3presData = [];
    const sensor3btrData = [];
    const sensor3posData = [];
    const sensor3gyroData = [];
    const sensor3accData = [];
    const sensor3signalData = [];
    const sensor3pplData = [];

    const sensor4tempData = [];
    const sensor4humData = [];
    const sensor4presData = [];
    const sensor4btrData = [];
    const sensor4posData = [];
    const sensor4gyroData = [];
    const sensor4accData = [];
    const sensor4signalData = [];
    const sensor4pplData = [];

    this.csvFileData.forEach((d) => {
      if (d.SITE_ID === 'BEL116') {
        sensor1tempData.push({'timeStamp': d.DATEOFF, 'x': d.SO4_CONC});
        sensor1humData.push({'timeStamp': d.DATEOFF, 'x': d.SO2_CONC});
        sensor1presData.push({'timeStamp': d.DATEOFF, 'x': d.NO3_CONC});
        sensor1btrData.push({'timeStamp': d.DATEOFF, 'x': this.lessThanHundred(d.CA_CONC * 100)});
        sensor1signalData.push({'timeStamp': d.DATEOFF, 'x': this.lessThanHundred(d.TNO3_CONC * 20)});
        sensor1posData.push({'timeStamp': d.DATEOFF,
          'x': (Number(d.SO2_CONC) * 10) + 40, 'y': Number(d.SO4_CONC) + 40, 'z': Number(d.SO2_CONC)});
        sensor1gyroData.push({'timeStamp': d.DATEOFF, 'x': d.NO3_CONC, 'y': d.HNO3_CONC});
        sensor1accData.push({'timeStamp': d.DATEOFF, 'x': this.accelrometerAdjustment(Number(d.SO2_CONC)),
          'y': this.accelrometerAdjustment(Number(d.SO4_CONC)), 'z': Number(d.SO2_CONC)});
        sensor1pplData.push({'timeStamp': d.DATEOFF, 'x': Math.round(d.SO2_CONC)});
      }
      if (d.SITE_ID === 'HWF187') {
        sensor2tempData.push({'timeStamp': d.DATEOFF, 'x': d.SO4_CONC});
        sensor2humData.push({'timeStamp': d.DATEOFF, 'x': d.SO2_CONC});
        sensor2presData.push({'timeStamp': d.DATEOFF, 'x': d.NO3_CONC});
        sensor2btrData.push({'timeStamp': d.DATEOFF, 'x': this.lessThanHundred(d.CA_CONC * 100)});
        sensor2signalData.push({'timeStamp': d.DATEOFF, 'x': this.lessThanHundred(d.TNO3_CONC * 20)});
        sensor2posData.push({'timeStamp': d.DATEOFF,
          'x': Number(d.SO2_CONC) + 280, 'y': (Number(d.SO4_CONC) * 5) + 200, 'z': Number(d.SO2_CONC)});
        sensor2accData.push({'timeStamp': d.DATEOFF, 'x': this.accelrometerAdjustment(Number(d.SO2_CONC)),
          'y': this.accelrometerAdjustment(Number(d.SO4_CONC)), 'z': Number(d.SO2_CONC)});
        sensor2gyroData.push({'timeStamp': d.DATEOFF, 'x': d.NO3_CONC, 'y': d.HNO3_CONC});
        sensor2pplData.push({'timeStamp': d.DATEOFF, 'x': Math.round(d.SO2_CONC)});
      }
      if (d.SITE_ID === 'BBE401') {
        sensor3tempData.push({'timeStamp': d.DATEOFF, 'x': d.SO4_CONC});
        sensor3humData.push({'timeStamp': d.DATEOFF, 'x': d.SO2_CONC});
        sensor3presData.push({'timeStamp': d.DATEOFF, 'x': d.NO3_CONC});
        sensor3btrData.push({'timeStamp': d.DATEOFF, 'x': this.lessThanHundred(d.CA_CONC * 100)});
        sensor3signalData.push({'timeStamp': d.DATEOFF, 'x': this.lessThanHundred(d.TNO3_CONC * 20)});
        sensor3posData.push({'timeStamp': d.DATEOFF,
          'x': (Number(d.SO2_CONC) * 10) + 100, 'y': (Number(d.SO4_CONC) * 10) + 450, 'z': Number(d.SO2_CONC)});
        sensor3accData.push({'timeStamp': d.DATEOFF, 'x': this.accelrometerAdjustment(Number(d.SO2_CONC)),
          'y': this.accelrometerAdjustment(Number(d.SO4_CONC)), 'z': Number(d.SO2_CONC)});
        sensor3gyroData.push({'timeStamp': d.DATEOFF, 'x': d.NO3_CONC, 'y': d.HNO3_CONC});
        sensor3pplData.push({'timeStamp': d.DATEOFF, 'x': Math.round(d.SO2_CONC)});
      }
      if (d.SITE_ID === 'PIN414') {
        sensor4tempData.push({'timeStamp': d.DATEOFF, 'x': d.SO4_CONC});
        sensor4humData.push({'timeStamp': d.DATEOFF, 'x': d.SO2_CONC});
        sensor4presData.push({'timeStamp': d.DATEOFF, 'x': d.NO3_CONC});
        sensor4btrData.push({'timeStamp': d.DATEOFF, 'x': this.lessThanHundred(d.CA_CONC * 100)});
        sensor4signalData.push({'timeStamp': d.DATEOFF, 'x': this.lessThanHundred(d.TNO3_CONC * 20)});
        sensor4posData.push({'timeStamp': d.DATEOFF,
          'x': (Number(d.SO2_CONC) * 5) + 450, 'y': (Number(d.SO4_CONC) * 50) + 100, 'z': Number(d.SO2_CONC)});
        sensor4accData.push({'timeStamp': d.DATEOFF, 'x': this.accelrometerAdjustment(Number(d.SO2_CONC)),
          'y': this.accelrometerAdjustment(Number(d.SO4_CONC)), 'z': Number(d.SO2_CONC)});
        sensor4gyroData.push({'timeStamp': d.DATEOFF, 'x': d.NO3_CONC, 'y': d.HNO3_CONC});
        sensor4pplData.push({'timeStamp': d.DATEOFF, 'x': Math.round(d.SO2_CONC)});
      }
    });

    this.sensordataList.push(
      {'id': '1A', 'data': sensor1tempData},
      {'id': '1B', 'data': sensor1humData},
      {'id': '1C', 'data': sensor1presData},
      {'id': '1D', 'data': sensor1posData},
      {'id': '1G', 'data': sensor1btrData},
      {'id': '1E', 'data': sensor1gyroData},
      {'id': '1I', 'data': sensor1pplData},
      {'id': '1H', 'data': sensor1signalData},
      {'id': '1J', 'data': sensor1accData},
      {'id': '2A', 'data': sensor2tempData},
      {'id': '2B', 'data': sensor2humData},
      {'id': '2C', 'data': sensor2presData},
      {'id': '2D', 'data': sensor2posData},
      {'id': '2G', 'data': sensor2btrData},
      {'id': '2E', 'data': sensor2gyroData},
      {'id': '2I', 'data': sensor2pplData},
      {'id': '2H', 'data': sensor2signalData},
      {'id': '2J', 'data': sensor2accData},
      {'id': '3A', 'data': sensor3tempData},
      {'id': '3B', 'data': sensor3humData},
      {'id': '3C', 'data': sensor3presData},
      {'id': '3D', 'data': sensor3posData},
      {'id': '3G', 'data': sensor3btrData},
      {'id': '3E', 'data': sensor3gyroData},
      {'id': '3J', 'data': sensor3accData},
      {'id': '3I', 'data': sensor3pplData},
      {'id': '3H', 'data': sensor3signalData},
      {'id': '4A', 'data': sensor4tempData},
      {'id': '4B', 'data': sensor4humData},
      {'id': '4C', 'data': sensor4presData},
      {'id': '4D', 'data': sensor4posData},
      {'id': '4G', 'data': sensor4btrData},
      {'id': '4E', 'data': sensor4gyroData},
      {'id': '4J', 'data': sensor4accData},
      {'id': '4I', 'data': sensor4pplData},
      {'id': '4H', 'data': sensor4signalData}
    );
  }

  accelrometerAdjustment(val) {
    const sign = (Math.random() < 0.5 ? -1 : 1);
    const result = ((val * Math.random() * 10) + 12 ) % 15;
    return sign * result;
  }

  lessThanHundred(val) {
    if (val > 100) {
      val = 100;
    }
    return val;
  }
}
