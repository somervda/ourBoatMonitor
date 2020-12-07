import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Observable, Subscription } from "rxjs";
import { Crud } from "../models/helper.model";
import {
  Device,
  IotDataSource,
  IotDataSourceInfo,
} from "../models/device.model";
import { HelperService } from "../services/helper.service";
import { DeviceService } from "../services/device.service";
import { Devicetype } from "../models/devicetype.model";
import { DocumentReference } from "@angular/fire/firestore";
import { DevicetypeService } from "../services/devicetype.service";

@Component({
  selector: "app-device",
  templateUrl: "./device.component.html",
  styleUrls: ["./device.component.scss"],
})
export class DeviceComponent implements OnInit, OnDestroy {
  device: Device;
  crudAction: Crud;
  // Declare an instance of crud enum to use for checking crudAction value
  Crud = Crud;
  IotDataSourceInfo = IotDataSourceInfo;

  deviceForm: FormGroup;
  deviceSubscription$$: Subscription;
  devicetypes$: Observable<Devicetype[]>;

  constructor(
    private deviceService: DeviceService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private helper: HelperService,
    private devicetypeService: DevicetypeService
  ) {}

  ngOnInit() {
    // console.log(
    //   "this.route.snapshot.paramMap.get('id')",
    //   this.route.snapshot.paramMap.get("id")
    // );

    this.devicetypes$ = this.devicetypeService.findAll(100);

    this.crudAction = Crud.Update;
    if (this.route.routeConfig.path == "device/:id/delete")
      this.crudAction = Crud.Delete;
    if (this.route.routeConfig.path == "device/create")
      this.crudAction = Crud.Create;

    if (this.crudAction == Crud.Create) {
      this.device = {
        name: "",
        description: "",
        deviceId: "",
        iotDataSource: null,
        deviceTypeRef: null,
        latitude: null,
        longitude: null,
        geoHash: null,
      };
    } else {
      this.device = this.route.snapshot.data["device"];
      this.deviceSubscription$$ = this.deviceService
        .findById(this.device.id)
        .subscribe((device) => {
          this.device = device;
          this.deviceForm.patchValue(this.device);
        });
    }

    // Create form group and initialize with probe values
    this.deviceForm = this.fb.group({
      name: [
        this.device.name,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(35),
        ],
      ],
      deviceId: [
        this.device.deviceId,
        [Validators.required, Validators.maxLength(80)],
      ],
      description: [
        this.device.description,
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(500),
        ],
      ],
      deviceTypeRef: [this.device.deviceTypeRef, [Validators.required]],
      iotDataSource: [this.device.iotDataSource, [Validators.required]],
      latitude: [
        this.device.latitude,
        [
          Validators.required,
          Validators.min(-90),
          Validators.max(90),
          Validators.pattern("^[-+]?[0-9]*.?[0-9]+$"),
        ],
      ],
      longitude: [
        this.device.longitude,
        [
          Validators.required,
          Validators.min(-180),
          Validators.max(180),
          Validators.pattern("^[-+]?[0-9]*.?[0-9]+$"),
        ],
      ],
    });

    // Mark all fields as touched to trigger validation on initial entry to the fields
    if (this.crudAction != Crud.Create) {
      for (const field in this.deviceForm.controls) {
        this.deviceForm.get(field).markAsTouched();
      }
    }
  }

  // onDevicetypeChange(selectedDevicetype) {
  //   console.log("onDevicetypeChange:", selectedDevicetype);
  //   onFieldUpdate()
  // }

  objectComparisonFunction = function (
    option: DocumentReference,
    value: DocumentReference
  ): boolean {
    // Needed to compare objects in select drop downs
    // console.log("compare", option, value);
    if (option == null && value == null) {
      return true;
    }
    return option?.path == value?.path;
  };

  onCreate() {
    // console.log("create probe", this.probe);
    for (const field in this.deviceForm.controls) {
      this.device[field] = this.deviceForm.get(field).value;
      if (field == "latitude" || field == "longitude") {
        this.device[field] = parseFloat(this.deviceForm.get(field).value);
      }
    }

    this.deviceService
      .create(this.device)
      .then((newDoc) => {
        this.crudAction = Crud.Update;
        this.device.id = newDoc.id;
        this.helper.snackbar(
          "Device '" + this.device.name + "' created.",
          2000
        );
        this.helper.redirect("/device/" + this.device.id);
      })
      .catch(function (error) {
        console.error("Error adding document: ", this.device.name, error);
      });
  }

  onDelete() {
    // console.log("delete", this.probe.id);
    const teamId = this.device.id;
    const name = this.device.name;
    this.deviceService
      .delete(this.device.id)
      .then(() => {
        this.helper.snackbar("Device '" + name + "' deleted!", 2000);
        this.helper.redirect("/devices");
      })
      .catch(function (error) {
        console.error("Error deleting device: ", error);
      });
  }

  onFieldUpdate(fieldName: string, toType?: string) {
    if (
      this.deviceForm.get(fieldName).valid &&
      this.device.id != "" &&
      this.crudAction == Crud.Update
    ) {
      // Update firestore
      let newValue = this.deviceForm.get(fieldName).value;
      if (toType && toType == "number") {
        newValue = parseFloat(this.deviceForm.get(fieldName).value);
      }
      this.deviceService.fieldUpdate(this.device.id, fieldName, newValue);
    }
  }

  ngOnDestroy() {
    if (this.deviceSubscription$$) this.deviceSubscription$$.unsubscribe();
  }
}
