import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { DocumentReference } from "@angular/fire/firestore";
import { Sensor } from "functions/src/models/sensor.model";
import { Observable, Subscription } from "rxjs";
import { Application } from "../models/application.model";
import { Crud } from "../models/helper.model";
import { Trigger, TriggerActionInfo } from "../models/trigger.model";
import { ApplicationService } from "../services/application.service";
import { HelperService } from "../services/helper.service";
import { SensorService } from "../services/sensor.service";
import { TriggerService } from "../services/trigger.service";

@Component({
  selector: "app-trigger",
  templateUrl: "./trigger.component.html",
  styleUrls: ["./trigger.component.scss"],
})
export class TriggerComponent implements OnInit, OnDestroy {
  trigger: Trigger;
  aid: string;
  dtid: string;
  application$: Observable<Application>;
  crudAction: Crud;
  // Declare an instance of crud enum to use for checking crudAction value
  Crud = Crud;

  triggerForm: FormGroup;
  trigger$$: Subscription;
  TriggerActionInfo = TriggerActionInfo;

  // sensors processing
  application$$: Subscription;
  // devices$: Observable<Device[]>;
  // devices$$: Subscription;
  // devicetypes$: Observable<Devicetype[]>;
  sensors$$: Subscription;
  sensors: Sensor[];

  constructor(
    private triggerService: TriggerService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private helper: HelperService,
    private applicationService: ApplicationService,
    private sensorService: SensorService
  ) {}

  ngOnInit() {
    console.log(
      "trigger init :",
      this.route.snapshot.paramMap.get("aid"),
      this.route.snapshot.paramMap.get("tid")
    );
    this.sensors = [];
    this.aid = this.route.snapshot.paramMap.get("aid");
    this.application$ = this.applicationService.findById(this.aid);
    this.crudAction = Crud.Update;
    if (this.route.routeConfig.path == "application/:aid/trigger/:tid/delete")
      this.crudAction = Crud.Delete;
    if (this.route.routeConfig.path == "application/:aid/trigger/create")
      this.crudAction = Crud.Create;

    if (this.crudAction == Crud.Create) {
      this.trigger = {
        name: "",
        description: "",
        active: null,
        sensorRef: null,
        triggerAction: null,
        triggerRangeMin: null,
        triggerRangeMax: null,
        message: null,
      };
    } else {
      this.trigger = this.route.snapshot.data["trigger"];
      this.trigger$$ = this.triggerService
        .findById(this.aid, this.trigger.id)
        .subscribe((trigger) => {
          this.trigger = trigger;
          this.triggerForm.patchValue(this.trigger);
        });
    }

    this.getSensors();

    // Create form group and initialize with probe values
    this.triggerForm = this.fb.group({
      name: [
        this.trigger.name,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(35),
        ],
      ],
      description: [
        this.trigger.description,
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(500),
        ],
      ],
      message: [
        this.trigger.message,
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(500),
        ],
      ],
      triggerAction: [this.trigger.triggerAction, [Validators.required]],
      active: [this.trigger.active],
      sensorRef: [this.trigger.sensorRef, [Validators.required]],
      triggerRangeMin: [
        this.trigger.triggerRangeMin,
        [Validators.required, Validators.pattern("^[-+]?[0-9]*.?[0-9]+$")],
      ],
      triggerRangeMax: [
        this.trigger.triggerRangeMax,
        [Validators.required, Validators.pattern("^[-+]?[0-9]*.?[0-9]+$")],
      ],
    });

    // Mark all fields as touched to trigger validation on initial entry to the fields
    if (this.crudAction != Crud.Create) {
      for (const field in this.triggerForm.controls) {
        this.triggerForm.get(field).markAsTouched();
      }
    }
  }

  onCreate() {
    console.log("create trigger", this.aid, this.trigger);
    for (const field in this.triggerForm.controls) {
      this.trigger[field] = this.triggerForm.get(field).value;
    }
    this.triggerService
      .create(this.aid, this.trigger)
      .then((newDoc) => {
        this.crudAction = Crud.Update;
        this.trigger.id = newDoc.id;
        this.helper.snackbar(
          "Trigger '" + this.trigger.name + "' created.",
          2000
        );
        this.helper.redirect(
          "/application/" + this.aid + "/trigger/" + this.trigger.id
        );
      })
      .catch(function (error) {
        console.error("Error adding document: ", this.trigger.name, error);
      });
  }

  onDelete() {
    console.log("delete", this.aid, this.trigger.id);
    const name = this.trigger.name;
    this.triggerService
      .delete(this.aid, this.trigger.id)
      .then(() => {
        this.helper.snackbar("Trigger '" + name + "' deleted!", 2000);
        this.helper.redirect("/application/" + this.aid);
      })
      .catch(function (error) {
        console.error("Error deleting trigger: ", error);
      });
  }

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

  onFieldUpdate(fieldName: string, toType?: string) {
    if (
      this.triggerForm.get(fieldName).valid &&
      this.trigger.id != "" &&
      this.aid &&
      this.crudAction != Crud.Delete
    ) {
      let newValue = this.triggerForm.get(fieldName).value;
      if (toType && toType == "Toggle") {
        newValue = !newValue;
      }

      console.log("update:", fieldName, newValue);
      this.triggerService.fieldUpdate(
        this.aid,
        this.trigger.id,
        fieldName,
        newValue
      );
    }
  }

  /**
   * Load the sensors array with all the sensors that could be used by the trigger
   * This runs through the relationships from the triggers parent application->
   * to the devices for the application -> to the devicetypee of those devices ->
   * and then getting the sensors for those devicetypes (only add unique sensors)
   *
   */
  private getSensors() {
    // Get all the unique sensorRefs for the application
    this.application$$ = this.application$.subscribe((application) => {
      const deviceRefs = application.deviceRefs;
      deviceRefs.forEach((deviceRef) => {
        deviceRef
          .get()
          .then((device) => {
            // get devicetype
            if (device.exists) {
              const devicetypeRef = <DocumentReference>(
                device.data()?.deviceTypeRef
              );
              this.dtid = devicetypeRef.id;
              // Get all sensors for devicetypeRef(s)
              this.sensors$$ = this.sensorService
                .findAll(this.dtid, 100)
                .subscribe((sensors) => {
                  sensors.forEach((sensor) => {
                    // Add sensor to sensor array if it isn't a duplicate
                    if (
                      !this.sensors.find(
                        (sensorItem) => sensorItem.id == sensor.id
                      )
                    ) {
                      this.sensors.push(sensor);
                    }
                  });
                });
            }
          })
          .catch();
      });
    });
  }

  getSensorRef(id: string) {
    return this.helper.docRef("devicetypes/" + this.dtid + "/sensors/" + id);
  }

  ngOnDestroy() {
    if (this.trigger$$) this.trigger$$.unsubscribe();
    if (this.application$$) this.application$$.unsubscribe();
    if (this.sensors$$) this.sensors$$.unsubscribe();
  }
}
