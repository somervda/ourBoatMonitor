import { Device } from "./../models/device.model";
import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { AuthService } from "../services/auth.service";
import { DeviceService } from "../services/device.service";

@Component({
  selector: "app-devices",
  templateUrl: "./devices.component.html",
  styleUrls: ["./devices.component.scss"],
})
export class DevicesComponent implements OnInit {
  devices$: Observable<Device[]>;
  displayedColumns: string[] = ["name", "description", "id"];

  constructor(
    private deviceService: DeviceService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.devices$ = this.deviceService.findAll(100);
  }
}
