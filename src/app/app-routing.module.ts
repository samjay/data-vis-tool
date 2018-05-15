import { NgModule } from '@angular/core';
import { RouterModule, Routes} from '@angular/router';
import {SensorListComponent} from './sensor-list/sensor-list.component';
import {ChartComponent} from './chart/chart.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full'},
  { path: 'home', component: SensorListComponent}
];

@NgModule({
  imports: [ RouterModule.forRoot(routes)],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
