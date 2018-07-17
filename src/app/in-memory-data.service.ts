import {InMemoryDbService} from 'angular-in-memory-web-api';
import {SensorLocation} from './models/sensor-location';
import {SENSORS} from './sensor-list/sensors-list';
import {Tunnel} from './models/tunnel';
import {TunnelNetwork} from './models/tunnel-network';
import * as d3 from 'd3';

export class InMemoryDataService implements InMemoryDbService {
  csvFileData = [];
  sensordataList = [];
  createDb() {
    d3.csv('assets/Concentration - Weekly.csv').then((data) => {
      this.csvFileData = data;
      this.createSensorData();
    });

    const sensorNodes = [
      {'signal': 80, 'battery': 50},
      {'signal': 30, 'battery': 10},
      {'signal': 90, 'battery': 55},
      {'signal': 10, 'battery': 70},
      {'signal': 60, 'battery': 70},
      {'signal': 100, 'battery': 42}
      // {'signal': 53, 'battery': 12},
      // {'signal': 89, 'battery': 6}
    ];

    const locations: SensorLocation[] = [
      { id: 1,
        x: 1, y: 1, z: 0,
        sensor_list: [SENSORS[0], SENSORS[1]],
        status_ok: true
      },
      { id: 2,
        x: 150, y: 1, z: 0,
        sensor_list: [SENSORS[2], SENSORS[4]],
        status_ok: true
      },
      { id: 3,
        x: 170, y: 30, z: 0,
        sensor_list: [SENSORS[1], SENSORS[2], SENSORS[6]],
        status_ok: false
      },
      { id: 4,
        x: 300, y: 30, z: 0,
        sensor_list: [SENSORS[0], SENSORS[2], SENSORS[4]],
        status_ok: true
      },
      { id: 5,
        x: 120, y: 140, z: 0,
        sensor_list: [SENSORS[6], SENSORS[1], SENSORS[2]],
        status_ok: false
      },
      { id: 6,
        x: 70, y: 130, z: 0,
        sensor_list: [SENSORS[0], SENSORS[2], SENSORS[4]],
        status_ok: true
      },
      { id: 7,
        x: 90, y: 140, z: 0,
        sensor_list: [SENSORS[1], SENSORS[4], SENSORS[6]],
        status_ok: true
      },
      { id: 8,
        x: 250, y: 140, z: 0,
        sensor_list: [SENSORS[0], SENSORS[2], SENSORS[1]],
        status_ok: false
      },
      { id: 9,
        x: 300, y: 220, z: 0,
        sensor_list: [SENSORS[6], SENSORS[2], SENSORS[0]],
        status_ok: true
      },
      { id: 10,
        x: 30, y: 220, z: 0,
        sensor_list: [SENSORS[0], SENSORS[6], SENSORS[4]],
        status_ok: false
      }
    ];

    const tunnel1: Tunnel = { locations: [locations[0], locations[1], locations[2], locations[3]]};
    const tunnel2: Tunnel = { locations: [locations[0], locations[1], locations[2], locations[4]]};
    const tunnel3: Tunnel = { locations: [locations[5], locations[6], locations[4], locations[7], locations[8]]};
    const tunnel4: Tunnel = { locations: [locations[9], locations[4]]};

    const tunnelNet: TunnelNetwork = {tunnels: [tunnel1, tunnel2, tunnel3, tunnel4],
      locations: locations};

    return {'tunnelNet': tunnelNet, 'locations': tunnelNet.locations,
      'sensorData': this.sensordataList};
  }

  createSensorData() {
    console.log('creating sensor data');
    const sensor1tempData = [];
    const sensor1humData = [];
    const sensor1presData = [];
    const sensor1btrData = [];
    const sensor1gyroData = [];
    const sensor1signalData = [];

    const sensor2tempData = [];
    const sensor2humData = [];
    const sensor2presData = [];
    const sensor2btrData = [];
    const sensor2gyroData = [];
    const sensor2signalData = [];

    const sensor3tempData = [];
    const sensor3humData = [];
    const sensor3presData = [];
    const sensor3btrData = [];
    const sensor3gyroData = [];
    const sensor3signalData = [];

    const sensor4tempData = [];
    const sensor4humData = [];
    const sensor4presData = [];
    const sensor4btrData = [];
    const sensor4gyroData = [];
    const sensor4signalData = [];

    this.csvFileData.forEach((d) => {
      if (d.SITE_ID === 'BEL116') {
        sensor1tempData.push({'timeStamp': d.DATEOFF, 'x': d.SO4_CONC});
        sensor1humData.push({'timeStamp': d.DATEOFF, 'x': d.SO2_CONC});
        sensor1presData.push({'timeStamp': d.DATEOFF, 'x': d.NO3_CONC});
        sensor1btrData.push({'timeStamp': d.DATEOFF, 'x': this.lessThanHundred(d.CA_CONC * 100)});
        sensor1signalData.push({'timeStamp': d.DATEOFF, 'x': this.lessThanHundred(d.TNO3_CONC * 20)});
        sensor1gyroData.push({'timeStamp': d.DATEOFF, 'x': d.NO3_CONC, 'y': d.HNO3_CONC});
      }
      if (d.SITE_ID === 'HWF187') {
        sensor2tempData.push({'timeStamp': d.DATEOFF, 'x': d.SO4_CONC});
        sensor2humData.push({'timeStamp': d.DATEOFF, 'x': d.SO2_CONC});
        sensor2presData.push({'timeStamp': d.DATEOFF, 'x': d.NO3_CONC});
        sensor2btrData.push({'timeStamp': d.DATEOFF, 'x': this.lessThanHundred(d.CA_CONC * 100)});
        sensor2signalData.push({'timeStamp': d.DATEOFF, 'x': this.lessThanHundred(d.TNO3_CONC * 20)});
        sensor2gyroData.push({'timeStamp': d.DATEOFF, 'x': d.NO3_CONC, 'y': d.HNO3_CONC});
      }
      if (d.SITE_ID === 'BBE401') {
        sensor3tempData.push({'timeStamp': d.DATEOFF, 'x': d.SO4_CONC});
        sensor3humData.push({'timeStamp': d.DATEOFF, 'x': d.SO2_CONC});
        sensor3presData.push({'timeStamp': d.DATEOFF, 'x': d.NO3_CONC});
        sensor3btrData.push({'timeStamp': d.DATEOFF, 'x': this.lessThanHundred(d.CA_CONC * 100)});
        sensor3signalData.push({'timeStamp': d.DATEOFF, 'x': this.lessThanHundred(d.TNO3_CONC * 20)});
        sensor3gyroData.push({'timeStamp': d.DATEOFF, 'x': d.NO3_CONC, 'y': d.HNO3_CONC});
      }
      if (d.SITE_ID === 'PIN414') {
        sensor4tempData.push({'timeStamp': d.DATEOFF, 'x': d.SO4_CONC});
        sensor4humData.push({'timeStamp': d.DATEOFF, 'x': d.SO2_CONC});
        sensor4presData.push({'timeStamp': d.DATEOFF, 'x': d.NO3_CONC});
        sensor4btrData.push({'timeStamp': d.DATEOFF, 'x': this.lessThanHundred(d.CA_CONC * 100)});
        sensor4signalData.push({'timeStamp': d.DATEOFF, 'x': this.lessThanHundred(d.TNO3_CONC * 20)});
        sensor4gyroData.push({'timeStamp': d.DATEOFF, 'x': d.NO3_CONC, 'y': d.HNO3_CONC});
      }
    });

    this.sensordataList.push(
      {'id': '1A', 'data': sensor1tempData},
      {'id': '1B', 'data': sensor1humData},
      {'id': '1C', 'data': sensor1presData},
      {'id': '1G', 'data': sensor1btrData},
      {'id': '1E', 'data': sensor1gyroData},
      {'id': '1H', 'data': sensor1signalData},
      {'id': '2A', 'data': sensor2tempData},
      {'id': '2B', 'data': sensor2humData},
      {'id': '2C', 'data': sensor2presData},
      {'id': '2G', 'data': sensor2btrData},
      {'id': '2E', 'data': sensor2gyroData},
      {'id': '2H', 'data': sensor2signalData},
      {'id': '3A', 'data': sensor3tempData},
      {'id': '3B', 'data': sensor3humData},
      {'id': '3C', 'data': sensor3presData},
      {'id': '3G', 'data': sensor3btrData},
      {'id': '3E', 'data': sensor3gyroData},
      {'id': '3H', 'data': sensor3signalData},
      {'id': '4A', 'data': sensor4tempData},
      {'id': '4B', 'data': sensor4humData},
      {'id': '4C', 'data': sensor4presData},
      {'id': '4G', 'data': sensor4btrData},
      {'id': '4E', 'data': sensor4gyroData},
      {'id': '4H', 'data': sensor4signalData}
    );
  }

  lessThanHundred(val) {
    if (val > 100) {
      val = 100;
    }
    return val;
  }
}
