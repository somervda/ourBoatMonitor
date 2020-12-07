import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { Crud } from "../models/helper.model";
import { Application } from "../models/application.model";
import { HelperService } from "../services/helper.service";
import { ApplicationService } from "../services/application.service";
import { MatDialog } from "@angular/material/dialog";
import { DeviceselectordialogComponent } from "../dialogs/deviceselectordialog/deviceselectordialog.component";
import { UserselectordialogComponent } from "../dialogs/userselectordialog/userselectordialog.component";

@Component({
  selector: "app-application",
  templateUrl: "./application.component.html",
  styleUrls: ["./application.component.scss"],
})
export class ApplicationComponent implements OnInit, OnDestroy {
  application: Application;

  crudAction: Crud;
  // Declare an instance of crud enum to use for checking crudAction value
  Crud = Crud;

  applicationForm: FormGroup;
  applicationSubscription$$: Subscription;

  constructor(
    private applicationService: ApplicationService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private helper: HelperService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    // console.log(
    //   "this.route.snapshot.paramMap.get('id')",
    //   this.route.snapshot.paramMap.get("id")
    // );
    this.crudAction = Crud.Update;
    if (this.route.routeConfig.path == "application/:id/delete")
      this.crudAction = Crud.Delete;
    if (this.route.routeConfig.path == "application/create")
      this.crudAction = Crud.Create;

    if (this.crudAction == Crud.Create) {
      this.application = {
        name: "",
        description: "",
        deviceRefs: null,
        userRefs: null,
      };
    } else {
      this.application = this.route.snapshot.data["application"];
      this.applicationSubscription$$ = this.applicationService
        .findById(this.application.id)
        .subscribe((application) => {
          this.application = application;
          this.applicationForm.patchValue(this.application);
        });
    }

    // Create form group and initialize with probe values
    this.applicationForm = this.fb.group({
      name: [
        this.application.name,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(35),
        ],
      ],
      description: [
        this.application.description,
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(500),
        ],
      ],
    });

    // Mark all fields as touched to trigger validation on initial entry to the fields
    if (this.crudAction != Crud.Create) {
      for (const field in this.applicationForm.controls) {
        this.applicationForm.get(field).markAsTouched();
      }
    }
  }

  onCreate() {
    // console.log("create probe", this.probe);
    for (const field in this.applicationForm.controls) {
      this.application[field] = this.applicationForm.get(field).value;
    }

    this.applicationService
      .create(this.application)
      .then((newDoc) => {
        this.crudAction = Crud.Update;
        this.application.id = newDoc.id;
        this.helper.snackbar(
          "Application '" + this.application.name + "' created.",
          2000
        );
        this.helper.redirect("/application/" + this.application.id);
      })
      .catch(function (error) {
        console.error("Error adding document: ", this.application.name, error);
      });
  }

  onDelete() {
    // console.log("delete", this.probe.id);
    const teamId = this.application.id;
    const name = this.application.name;
    this.applicationService
      .delete(this.application.id)
      .then(() => {
        this.helper.snackbar("Application '" + name + "' deleted!", 2000);
        this.helper.redirect("/applications");
      })
      .catch(function (error) {
        console.error("Error deleting application: ", error);
      });
  }

  onFieldUpdate(fieldName: string, toType?: string) {
    if (
      this.applicationForm.get(fieldName).valid &&
      this.application.id != "" &&
      this.crudAction != Crud.Delete
    ) {
      let newValue = this.applicationForm.get(fieldName).value;
      this.applicationService.fieldUpdate(
        this.application.id,
        fieldName,
        newValue
      );
    }
  }

  updateDevices() {
    // console.log("updateUserGroups");
    let refSelected = [];
    if (this.application.deviceRefs) {
      refSelected = [...this.application.deviceRefs];
    }

    const dialogRef = this.dialog.open(DeviceselectordialogComponent, {
      minWidth: "380px",
      maxWidth: "500px",
      width: "80%",
      autoFocus: false,
      data: { refSelected: refSelected },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // console.log("update usergroups", result);
        this.applicationService.fieldUpdate(
          this.application.id,
          "deviceRefs",
          result
        );
        this.application.deviceRefs = result;
      }
    });
  }

  updateUsers() {
    // console.log("updateUserGroups");
    let refSelected = [];
    if (this.application.userRefs) {
      refSelected = [...this.application.userRefs];
    }

    const dialogRef = this.dialog.open(UserselectordialogComponent, {
      minWidth: "380px",
      maxWidth: "500px",
      width: "80%",
      autoFocus: false,
      data: { refSelected: refSelected },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // console.log("update usergroups", result);
        this.applicationService.fieldUpdate(
          this.application.id,
          "userRefs",
          result
        );
        this.application.userRefs = result;
      }
    });
  }

  ngOnDestroy() {
    if (this.applicationSubscription$$)
      this.applicationSubscription$$.unsubscribe();
  }
}
