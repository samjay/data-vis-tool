import { NgModule } from '@angular/core';
import { RouterModule, Routes} from '@angular/router';
import {SensorListComponent} from './sensor-list/sensor-list.component';
import {TunnelNetworkComponent} from './tunnel-network/tunnel-network.component';
import {SensorNetworkComponent} from './sensor-network/sensor-network.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full'},
  { path: 'home', component: TunnelNetworkComponent},
  { path: 'sensors', component: SensorNetworkComponent},
  { path: 'location/:id', component: SensorListComponent}
];

@NgModule({
  imports: [ RouterModule.forRoot(routes)],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
