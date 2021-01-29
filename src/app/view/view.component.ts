import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { DocumentReference } from "@angular/fire/firestore";
import { Sensor } from "functions/src/models/sensor.model";
import { Observable, Subscription } from "rxjs";
import { Application } from "../models/application.model";
import { Crud } from "../models/helper.model";
import { View, ViewTypeInfo } from "../models/view.model";
import { ApplicationService } from "../services/application.service";
import { HelperService } from "../services/helper.service";
import { SensorService } from "../services/sensor.service";
import { ViewService } from "../services/view.service";
import { AngularFireStorage } from "@angular/fire/storage";

@Component({
  selector: "app-view",
  templateUrl: "./view.component.html",
  styleUrls: ["./view.component.scss"],
})
export class ViewComponent implements OnInit, OnDestroy {
  view: View;
  aid: string;
  dtid: string;
  application$: Observable<Application>;
  crudAction: Crud;
  // Declare an instance of crud enum to use for checking crudAction value
  Crud = Crud;

  showSpinner = false;
  fileUploadMsg = "";

  viewForm: FormGroup;
  view$$: Subscription;
  ViewTypeInfo = ViewTypeInfo;

  // sensors processing
  application$$: Subscription;
  sensors$$: Subscription;
  sensors: Sensor[];

  constructor(
    private viewService: ViewService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private helper: HelperService,
    private applicationService: ApplicationService,
    private sensorService: SensorService,
    private storage: AngularFireStorage
  ) {}

  ngOnInit() {
    console.log(
      "view init :",
      this.route.snapshot.paramMap.get("aid"),
      this.route.snapshot.paramMap.get("vid")
    );
    this.sensors = [];
    this.aid = this.route.snapshot.paramMap.get("aid");
    this.application$ = this.applicationService.findById(this.aid);
    this.crudAction = Crud.Update;
    if (this.route.routeConfig.path == "application/:aid/view/:vid/delete")
      this.crudAction = Crud.Delete;
    if (this.route.routeConfig.path == "application/:aid/view/create")
      this.crudAction = Crud.Create;

    if (this.crudAction == Crud.Create) {
      this.view = {
        name: "",
        description: "",
        sensorRef: null,
        viewType: null,
      };
    } else {
      this.view = this.route.snapshot.data["view"];
      this.view$$ = this.viewService
        .findById(this.aid, this.view.id)
        .subscribe((view) => {
          this.view = view;
          this.viewForm.patchValue(this.view);
        });
    }

    this.getSensors();

    // Create form group and initialize with probe values
    this.viewForm = this.fb.group({
      name: [
        this.view.name,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(35),
        ],
      ],
      description: [
        this.view.description,
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(500),
        ],
      ],
      viewType: [this.view.viewType, [Validators.required]],
      sensorRef: [this.view.sensorRef, [Validators.required]],
      offset: [
        this.view.offset,
        [Validators.pattern("[+-]?([0-9]*[.])?[0-9]+")],
      ],
      scale: [this.view.scale, [Validators.pattern("[+-]?([0-9]*[.])?[0-9]+")]],
    });

    // Mark all fields as touched to view validation on initial entry to the fields
    if (this.crudAction != Crud.Create) {
      for (const field in this.viewForm.controls) {
        this.viewForm.get(field).markAsTouched();
      }
    }
  }

  onCreate() {
    console.log("create view", this.aid, this.view);
    for (const field in this.viewForm.controls) {
      if (field == "offset" || field == "scale") {
        if (this.viewForm.get(field).value) {
          this.view[field] = Number(this.viewForm.get(field).value);
        }
      } else {
        this.view[field] = this.viewForm.get(field).value;
      }
    }
    this.viewService
      .create(this.aid, this.view)
      .then((newDoc) => {
        this.crudAction = Crud.Update;
        this.view.id = newDoc.id;
        this.helper.snackbar("View '" + this.view.name + "' created.", 2000);
        this.helper.redirect(
          "/application/" + this.aid + "/view/" + this.view.id
        );
      })
      .catch(function (error) {
        console.error("Error adding document: ", this.view.name, error);
      });
  }

  onDelete() {
    console.log("delete", this.aid, this.view.id);
    const name = this.view.name;
    this.viewService
      .delete(this.aid, this.view.id)
      .then(() => {
        this.helper.snackbar("View '" + name + "' deleted!", 2000);
        this.helper.redirect("/application/" + this.aid);
      })
      .catch(function (error) {
        console.error("Error deleting view: ", error);
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
      this.viewForm.get(fieldName).valid &&
      this.view.id != "" &&
      this.aid &&
      this.crudAction != Crud.Delete
    ) {
      let newValue = this.viewForm.get(fieldName).value;
      if (toType && toType == "Number") {
        newValue = Number(newValue);
      }
      console.log("update:", fieldName, newValue);
      this.viewService.fieldUpdate(this.aid, this.view.id, fieldName, newValue);
    }
  }

  /**
   * Load the sensors array with all the sensors that could be used by the view
   * This runs through the relationships from the view parent application->
   * to the devices for the application -> to the devicetype of those devices ->
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

  onUploadFile(event) {
    console.log("onUploadFile", event);
    const fileToUpload = event.target.files[0];
    console.log("fileToUpload", fileToUpload.size);
    if (fileToUpload.size > 20000) {
      this.fileUploadMsg =
        " File is too large to upload. Icon image files must be less than 20KB";
    } else {
      this.showSpinner = true;
      this.fileUploadMsg = "";
      const task = this.storage
        .upload(`viewIcons/${this.view.id}/${fileToUpload.name}`, fileToUpload)
        .then((t) => {
          this.getStorageUrl(fileToUpload.name)
            .toPromise()
            .then((url) => {
              this.viewService.fieldUpdate(
                this.aid,
                this.view.id,
                "iconURL",
                url
              );
              this.view.iconURL = url;
            });
          this.showSpinner = false;
        })
        .catch((e) => (this.showSpinner = false));
    }
  }

  getStorageUrl(filename: string): Observable<any> {
    // console.log("getStorageUrl", filename);
    return this.storage
      .ref(`viewIcons/${this.view.id}/${filename}`)
      .getDownloadURL();
  }

  ngOnDestroy() {
    if (this.view$$) this.view$$.unsubscribe();
    if (this.application$$) this.application$$.unsubscribe();
    if (this.sensors$$) this.sensors$$.unsubscribe();
  }
}
