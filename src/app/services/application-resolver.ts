import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
} from "@angular/router";
import { ApplicationService } from "./application.service";
import { Application } from "../models/application.model";
import { Observable } from "rxjs";
import { first } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class ApplicationResolver implements Resolve<Application> {
  constructor(private applicationService: ApplicationService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<Application> {
    const id = route.paramMap.get("id");
    return this.applicationService.findById(id).pipe(first());
  }
}
