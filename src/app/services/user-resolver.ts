import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
} from "@angular/router";
import { UserService } from "./user.service";
import { User } from "../models/user.model";
import { Observable } from "rxjs";
import { first } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class UserResolver implements Resolve<User> {
  constructor(private userservice: UserService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<User> {
    const uid = route.paramMap.get("uid");
    return this.userservice.findUserByUid(uid).pipe(first());
  }
}
