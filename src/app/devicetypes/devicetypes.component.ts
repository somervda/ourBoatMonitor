import { Devicetype } from "./../models/devicetype.model";
import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { AuthService } from "../services/auth.service";
import { DevicetypeService } from "../services/devicetype.service";

@Component({
  selector: "app-devicetypes",
  templateUrl: "./devicetypes.component.html",
  styleUrls: ["./devicetypes.component.scss"],
})
export class DevicetypesComponent implements OnInit {
  devicetypes$: Observable<Devicetype[]>;
  displayedColumns: string[] = ["name", "description", "id"];

  constructor(
    private devicetypeService: DevicetypeService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.devicetypes$ = this.devicetypeService.findAll(100);
  }
}
