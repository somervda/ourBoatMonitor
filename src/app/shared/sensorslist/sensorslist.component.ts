import { Component, OnInit, Input } from "@angular/core";
import { Observable } from "rxjs";
import { Devicetype } from "src/app/models/devicetype.model";
import { Sensor, UOM, UOMInfo, UOMInfoItem } from "src/app/models/sensor.model";
import { SensorService } from "src/app/services/sensor.service";

@Component({
  selector: "app-sensorslist",
  templateUrl: "./sensorslist.component.html",
  styleUrls: ["./sensorslist.component.scss"],
})
export class SensorslistComponent implements OnInit {
  @Input() devicetype: Devicetype;
  @Input() disabled: boolean;
  UOMInfo = UOMInfo;
  displayedColumns: string[] = ["name", "description", "uom", "id"];
  sensors$: Observable<Sensor[]>;

  constructor(private sensorService: SensorService) {}

  getUOMInfoItem(uom: UOM): UOMInfoItem {
    let uomInfo = this.UOMInfo.find((u) => u.uom == uom);
    // console.log("uomInfo:", uom, uomInfo);
    return uomInfo;
  }

  ngOnInit() {
    this.sensors$ = this.sensorService.findAll(this.devicetype.id, 100);
  }
}
