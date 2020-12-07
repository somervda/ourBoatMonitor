import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
} from "@angular/router";
import { ViewService } from "./view.service";
import { View } from "../models/view.model";
import { Observable } from "rxjs";
import { first } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class ViewResolver implements Resolve<View> {
  constructor(private viewService: ViewService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<View> {
    const aid = route.paramMap.get("aid");
    const vid = route.paramMap.get("vid");
    return this.viewService.findById(aid, vid).pipe(first());
  }
}
