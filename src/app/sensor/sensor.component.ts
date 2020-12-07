import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Observable, Subscription } from "rxjs";
import { Devicetype } from "../models/devicetype.model";
import { Crud } from "../models/helper.model";
import { Sensor, UOMInfo } from "../models/sensor.model";
import { DevicetypeService } from "../services/devicetype.service";
import { HelperService } from "../services/helper.service";
import { SensorService } from "../services/sensor.service";

@Component({
  selector: "app-sensor",
  templateUrl: "./sensor.component.html",
  styleUrls: ["./sensor.component.scss"],
})
export class SensorComponent implements OnInit, OnDestroy {
  sensor: Sensor;
  did: string;
  devicetype$: Observable<Devicetype>;
  crudAction: Crud;
  // Declare an instance of crud enum to use for checking crudAction value
  Crud = Crud;
  UOMInfo = UOMInfo;

  sensorForm: FormGroup;
  sensorSubscription$$: Subscription;

  constructor(
    private sensorService: SensorService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private helper: HelperService,
    private devicetypeService: DevicetypeService
  ) {}

  ngOnInit() {
    console.log(
      "sensor init :",
      this.route.snapshot.paramMap.get("did"),
      this.route.snapshot.paramMap.get("sid")
    );
    this.did = this.route.snapshot.paramMap.get("did");
    this.devicetype$ = this.devicetypeService.findById(this.did);
    this.crudAction = Crud.Update;
    if (this.route.routeConfig.path == "devicetype/:did/sensor/:sid/delete")
      this.crudAction = Crud.Delete;
    if (this.route.routeConfig.path == "devicetype/:did/sensor/create")
      this.crudAction = Crud.Create;

    if (this.crudAction == Crud.Create) {
      this.sensor = {
        name: "",
        description: "",
        uom: null,
        acquisitionMapValue: null,
        acquisitionMapLatitude: null,
        acquisitionMapLongitude: null,
      };
    } else {
      this.sensor = this.route.snapshot.data["sensor"];
      this.sensorSubscription$$ = this.sensorService
        .findById(this.did, this.sensor.id)
        .subscribe((sensor) => {
          this.sensor = sensor;
          this.sensorForm.patchValue(this.sensor);
        });
    }

    // Create form group and initialize with probe values
    this.sensorForm = this.fb.group({
      name: [
        this.sensor.name,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(35),
        ],
      ],
      description: [
        this.sensor.description,
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(500),
        ],
      ],
      uom: [this.sensor.uom, [Validators.required]],
      acquisitionMapValue: [this.sensor.acquisitionMapValue],
      acquisitionMapLatitude: [this.sensor.acquisitionMapLatitude],
      acquisitionMapLongitude: [this.sensor.acquisitionMapLongitude],
    });

    // Mark all fields as touched to trigger validation on initial entry to the fields
    if (this.crudAction != Crud.Create) {
      for (const field in this.sensorForm.controls) {
        this.sensorForm.get(field).markAsTouched();
      }
    }
  }

  onCreate() {
    console.log("create sensor", this.did, this.sensor);
    for (const field in this.sensorForm.controls) {
      this.sensor[field] = this.sensorForm.get(field).value;
    }
    this.sensorService
      .create(this.did, this.sensor)
      .then((newDoc) => {
        this.crudAction = Crud.Update;
        this.sensor.id = newDoc.id;
        this.helper.snackbar(
          "Sensor '" + this.sensor.name + "' created.",
          2000
        );
        this.helper.redirect(
          "/devicetype/" + this.did + "/sensor/" + this.sensor.id
        );
      })
      .catch(function (error) {
        console.error("Error adding document: ", this.sensor.name, error);
      });
  }

  onDelete() {
    console.log("delete", this.did, this.sensor.id);
    const name = this.sensor.name;
    this.sensorService
      .delete(this.did, this.sensor.id)
      .then(() => {
        this.helper.snackbar("Sensor '" + name + "' deleted!", 2000);
        this.helper.redirect("/devicetype/" + this.did);
      })
      .catch(function (error) {
        console.error("Error deleting sensor: ", error);
      });
  }

  onFieldUpdate(fieldName: string, toType?: string) {
    if (
      this.sensorForm.get(fieldName).valid &&
      this.sensor.id != "" &&
      this.did &&
      this.crudAction != Crud.Delete
    ) {
      let newValue = this.sensorForm.get(fieldName).value;
      this.sensorService.fieldUpdate(
        this.did,
        this.sensor.id,
        fieldName,
        newValue
      );
    }
  }

  ngOnDestroy() {
    if (this.sensorSubscription$$) this.sensorSubscription$$.unsubscribe();
  }
}
