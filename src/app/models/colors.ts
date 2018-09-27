import * as d3 from 'd3';
export const COLORS = [ d3.rgb(Math.random() * 255, Math.random() * 255, Math.random() * 255),
  d3.rgb(Math.random() * 255, Math.random() * 255, Math.random() * 255),
  d3.rgb(Math.random() * 255, Math.random() * 255, Math.random() * 255),
  d3.rgb(Math.random() * 255, Math.random() * 255, Math.random() * 255),
  d3.rgb(Math.random() * 255, Math.random() * 255, Math.random() * 255),
  d3.rgb(Math.random() * 255, Math.random() * 255, Math.random() * 255)];

export const colorTypes = { ryg: 'RYG', btr: 'BTR', single: 'SINGLE'};
export const rygColors = [
  '#FF0000',
  '#FF1000',
  '#FF2000',
  '#FF3000',
  '#FF4000',
  '#FF5000',
  '#FF6000',
  '#FF7000',
  '#FF8000',
  '#FF9000',
  '#FFA000',
  '#FFB000',
  '#FFC000',
  '#FFD000',
  '#FFE000',
  '#FFF000',
  '#FFFF00',
  '#F0FF00',
  '#E0FF00',
  '#D0FF00',
  '#C0FF00',
  '#B0FF00',
  '#A0FF00',
  '#90FF00',
  '#80FF00',
  '#70FF00',
  '#60FF00',
  '#50FF00',
  '#40FF00',
  '#30FF00',
  '#20FF00',
  '#10FF00'];

export const bToRColors = [
  '#1A09BE',
  '#1B27A7',
  '#1D4590',
  '#1E6379',
  '#208162',
  '#229F4B',
  '#23BD34',
  '#25DB1D',
  '#27F906',
  '#41DB06',
  '#5BBD06',
  '#759F06',
  '#908106',
  '#AA6306',
  '#C44506',
  '#DE2706',
  '#F90906'
];

export const sensorColors = [
  {type: 'A', color: 'salmon', hardColor: 'indianRed'},
  {type: 'B', color: 'aquamarine', hardColor: 'lightSeaGreen'},
  {type: 'C', color: 'orchid', hardColor: 'darkOrchid'},
  {type: 'G', color: 'seaGreen', hardColor: 'green'},
  {type: 'H', color: 'green', hardColor: 'darkGreen'},
  {type: 'I', color: 'chocolate', hardColor: 'saddleBrown'}
];

export const maxOpacity = 0.8;

