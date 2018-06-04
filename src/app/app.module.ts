import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { ChartComponent } from './chart/chart.component';
import { SensorListComponent } from './sensor-list/sensor-list.component';
import {SensorsService} from './sensors.service';
import { AppRoutingModule } from './/app-routing.module';
import {FormsModule} from '@angular/forms';
import { BarChartComponent } from './bar-chart/bar-chart.component';
import { ScatterPlotComponent } from './scatter-plot/scatter-plot.component';
import {DateFilterService} from './date-filter.service';
import { DateSliderComponent } from './date-slider/date-slider.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import {NouisliderModule} from 'ng2-nouislider';

@NgModule({
  declarations: [
    AppComponent,
    ChartComponent,
    SensorListComponent,
    BarChartComponent,
    ScatterPlotComponent,
    DateSliderComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    NouisliderModule
  ],
  providers: [
    SensorsService,
    DateFilterService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
