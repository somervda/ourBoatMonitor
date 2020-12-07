import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
} from "@angular/router";
import { SensorService } from "./sensor.service";
import { Sensor } from "../models/sensor.model";
import { Observable } from "rxjs";
import { first } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class SensorResolver implements Resolve<Sensor> {
  constructor(private sensorservice: SensorService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<Sensor> {
    const did = route.paramMap.get("did");
    const sid = route.paramMap.get("sid");
    return this.sensorservice.findById(did, sid).pipe(first());
  }
}
