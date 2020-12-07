import { Component, OnInit, Inject } from "@angular/core";
import { Device } from "../../models/device.model";
import { Observable } from "rxjs";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { DeviceService } from "src/app/services/device.service";
import { DocumentReference } from "@angular/fire/firestore";
import { HelperService } from "src/app/services/helper.service";

@Component({
  selector: "app-deviceselectordialog",
  templateUrl: "./deviceselectordialog.component.html",
  styleUrls: ["./deviceselectordialog.component.scss"],
})
export class DeviceselectordialogComponent implements OnInit {
  devices: DocumentReference[];
  devices$: Observable<Device[]>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private deviceService: DeviceService,
    private dialogRef: MatDialogRef<DeviceselectordialogComponent>,
    private helper: HelperService
  ) {}

  ngOnInit(): void {
    this.devices = this.data["refSelected"];
    // console.log("deviceselectordialog this.devices", this.devices);
    this.devices$ = this.deviceService.findAll(100);
  }

  returnItem() {
    // console.log("Close:", this.devices);
    this.dialogRef.close(this.devices);
  }

  onListItemSelected(id) {
    // console.log("onListItemSelected:", id);
    if (id) {
      if (this.isInDevice(id)) {
        // Remove from device array
        let index = this.devices.findIndex(
          (ug) => this.helper.getDocRefId(ug) == id
        ); //find index in your array
        this.devices.splice(index, 1); //remove element from array
      } else {
        const deviceDocRef = this.helper.docRef("devices/" + id);
        this.devices.push(deviceDocRef);
      }
    }
  }

  isInDevice(id: string) {
    if (this.devices.find((ug) => this.helper.getDocRefId(ug) == id))
      return true;
    return false;
  }
}
