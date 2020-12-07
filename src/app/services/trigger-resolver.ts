import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
} from "@angular/router";
import { TriggerService } from "./trigger.service";
import { Trigger } from "../models/trigger.model";
import { Observable } from "rxjs";
import { first } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class TriggerResolver implements Resolve<Trigger> {
  constructor(private triggerService: TriggerService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<Trigger> {
    const aid = route.paramMap.get("aid");
    const tid = route.paramMap.get("tid");
    return this.triggerService.findById(aid, tid).pipe(first());
  }
}
