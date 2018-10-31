import * as d3 from 'd3';

const defaultDateFormat = '%m/%d/%Y';
const sourceDateFormat = '%m/%d/%Y %H:%M:%S';
const axisDateFormat = '%b.%d.%y';
export const parseDefaultDate = d3.timeParse(defaultDateFormat);
export const formatDefaultDate = d3.timeFormat(defaultDateFormat);
export const parseSourceDate = d3.timeParse(sourceDateFormat);
export const formatSourceDate = d3.timeFormat(sourceDateFormat);
export const formatAxisDate = d3.timeFormat(axisDateFormat);

export const oneDay = 24 * 3600 * 1000;
