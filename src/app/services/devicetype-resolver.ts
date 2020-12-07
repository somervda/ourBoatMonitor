import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
} from "@angular/router";
import { DevicetypeService } from "./devicetype.service";
import { Devicetype } from "../models/devicetype.model";
import { Observable } from "rxjs";
import { first } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class DevicetypeResolver implements Resolve<Devicetype> {
  constructor(private devicetypeservice: DevicetypeService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<Devicetype> {
    const id = route.paramMap.get("id");
    return this.devicetypeservice.findById(id).pipe(first());
  }
}
