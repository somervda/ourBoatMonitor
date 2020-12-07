import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { Crud } from "../models/helper.model";
import { Devicetype } from "../models/devicetype.model";
import { HelperService } from "../services/helper.service";
import { DevicetypeService } from "../services/devicetype.service";

@Component({
  selector: "app-devicetype",
  templateUrl: "./devicetype.component.html",
  styleUrls: ["./devicetype.component.scss"],
})
export class DevicetypeComponent implements OnInit, OnDestroy {
  devicetype: Devicetype;
  crudAction: Crud;
  // Declare an instance of crud enum to use for checking crudAction value
  Crud = Crud;

  devicetypeForm: FormGroup;
  devicetypeSubscription$$: Subscription;

  constructor(
    private devicetypeService: DevicetypeService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private helper: HelperService
  ) {}

  ngOnInit() {
    // console.log(
    //   "this.route.snapshot.paramMap.get('id')",
    //   this.route.snapshot.paramMap.get("id")
    // );
    this.crudAction = Crud.Update;
    if (this.route.routeConfig.path == "devicetype/:id/delete")
      this.crudAction = Crud.Delete;
    if (this.route.routeConfig.path == "devicetype/create")
      this.crudAction = Crud.Create;

    if (this.crudAction == Crud.Create) {
      this.devicetype = {
        name: "",
        description: "",
      };
    } else {
      this.devicetype = this.route.snapshot.data["devicetype"];
      this.devicetypeSubscription$$ = this.devicetypeService
        .findById(this.devicetype.id)
        .subscribe((devicetype) => {
          this.devicetype = devicetype;
          this.devicetypeForm.patchValue(this.devicetype);
        });
    }

    // Create form group and initialize with probe values
    this.devicetypeForm = this.fb.group({
      name: [
        this.devicetype.name,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(35),
        ],
      ],
      description: [
        this.devicetype.description,
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(500),
        ],
      ],
    });

    // Mark all fields as touched to trigger validation on initial entry to the fields
    if (this.crudAction != Crud.Create) {
      for (const field in this.devicetypeForm.controls) {
        this.devicetypeForm.get(field).markAsTouched();
      }
    }
  }

  onCreate() {
    // console.log("create probe", this.probe);
    for (const field in this.devicetypeForm.controls) {
      this.devicetype[field] = this.devicetypeForm.get(field).value;
    }

    this.devicetypeService
      .create(this.devicetype)
      .then((newDoc) => {
        this.crudAction = Crud.Update;
        this.devicetype.id = newDoc.id;
        this.helper.snackbar(
          "Devicetype '" + this.devicetype.name + "' created.",
          2000
        );
        this.helper.redirect("/devicetype/" + this.devicetype.id);
      })
      .catch(function (error) {
        console.error("Error adding document: ", this.devicetype.name, error);
      });
  }

  onDelete() {
    // console.log("delete", this.probe.id);
    const teamId = this.devicetype.id;
    const name = this.devicetype.name;
    this.devicetypeService
      .delete(this.devicetype.id)
      .then(() => {
        this.helper.snackbar("Device Type '" + name + "' deleted!", 2000);
        this.helper.redirect("/devicetypes");
      })
      .catch(function (error) {
        console.error("Error deleting user group: ", error);
      });
  }

  onFieldUpdate(fieldName: string, toType?: string) {
    if (
      this.devicetypeForm.get(fieldName).valid &&
      this.devicetype.id != "" &&
      this.crudAction != Crud.Delete
    ) {
      let newValue = this.devicetypeForm.get(fieldName).value;
      this.devicetypeService.fieldUpdate(
        this.devicetype.id,
        fieldName,
        newValue
      );
    }
  }

  ngOnDestroy() {
    if (this.devicetypeSubscription$$)
      this.devicetypeSubscription$$.unsubscribe();
  }
}
