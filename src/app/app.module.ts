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

@NgModule({
  declarations: [
    AppComponent,
    ChartComponent,
    SensorListComponent,
    BarChartComponent,
    ScatterPlotComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule
  ],
  providers: [
    SensorsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
