import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
} from "@angular/router";
import { DeviceService } from "./device.service";
import { Device } from "../models/device.model";
import { Observable } from "rxjs";
import { first } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class DeviceResolver implements Resolve<Device> {
  constructor(private deviceservice: DeviceService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<Device> {
    const id = route.paramMap.get("id");
    return this.deviceservice.findById(id).pipe(first());
  }
}
