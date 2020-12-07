import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { Application } from "../models/application.model";
import { AuthService } from "../services/auth.service";
import { ApplicationService } from "../services/application.service";

@Component({
  selector: "app-applications",
  templateUrl: "./applications.component.html",
  styleUrls: ["./applications.component.scss"],
})
export class ApplicationsComponent implements OnInit {
  applications$: Observable<Application[]>;
  displayedColumns: string[] = ["name", "description", "id"];

  constructor(
    private applicationService: ApplicationService,
    private auth: AuthService
  ) {}
  ngOnInit() {
    this.applications$ = this.applicationService.findByUid(
      this.auth.currentUser.uid,
      100
    );
  }
}
