import { NgModule } from "@angular/core";
import { AngularFireModule } from "@angular/fire";
import { AngularFireAuthModule } from "@angular/fire/auth";
import { AngularFirestoreModule } from "@angular/fire/firestore";
import { AngularFirePerformanceModule } from "@angular/fire/performance";
import { AngularFireMessagingModule } from "@angular/fire/messaging";
// import { AngularFireStorageModule } from "@angular/fire/storage";
import { AngularFireStorageModule } from "@angular/fire/storage";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatChipsModule } from "@angular/material/chips";
import { MatDialogModule } from "@angular/material/dialog";
import { MatDividerModule } from "@angular/material/divider";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSelectModule } from "@angular/material/select";
import { MatSortModule } from "@angular/material/sort";
import { MatTableModule } from "@angular/material/table";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatTooltipModule } from "@angular/material/tooltip";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ServiceWorkerModule } from "@angular/service-worker";
import { environment } from "../environments/environment";
import { AboutComponent } from "./about/about.component";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { HomeComponent } from "./home/home.component";
import { LoginComponent } from "./login/login.component";
import { NotauthorizedComponent } from "./notauthorized/notauthorized.component";
import { NotfoundComponent } from "./notfound/notfound.component";
import { DocPipe } from "./pipes/doc.pipe";
import { TruncatePipe } from "./pipes/truncate.pipe";
import { SubheadingComponent } from "./shared/subheading/subheading.component";
import { UserComponent } from "./user/user.component";
import { UsersComponent } from "./users/users.component";
import { DevicetypesComponent } from "./devicetypes/devicetypes.component";
import { DevicetypeComponent } from "./devicetype/devicetype.component";
import { DeviceComponent } from "./device/device.component";
import { DevicesComponent } from "./devices/devices.component";
import { SensorComponent } from "./sensor/sensor.component";
import { SensorslistComponent } from "./shared/sensorslist/sensorslist.component";
import { ApplicationsComponent } from "./applications/applications.component";
import { ApplicationComponent } from "./application/application.component";
import { DeviceselectordialogComponent } from "./dialogs/deviceselectordialog/deviceselectordialog.component";
import { TriggerComponent } from "./trigger/trigger.component";
import { TriggerslistComponent } from "./shared/triggerslist/triggerslist.component";
import { UserselectordialogComponent } from "./dialogs/userselectordialog/userselectordialog.component";
import { ViewComponent } from "./view/view.component";
import { ViewslistComponent } from "./shared/viewslist/viewslist.component";
import { ConfirmdialogComponent } from "./dialogs/confirmdialog/confirmdialog.component";
import { MyviewsComponent } from "./myviews/myviews.component";
import { MyviewerComponent } from "./myviewer/myviewer.component";

import { GoogleChartsModule } from "angular-google-charts";

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NotfoundComponent,
    AboutComponent,
    LoginComponent,
    UsersComponent,
    UserComponent,
    NotauthorizedComponent,
    DocPipe,
    SubheadingComponent,
    TruncatePipe,
    DevicetypesComponent,
    DevicetypeComponent,
    DeviceComponent,
    DevicesComponent,
    SensorComponent,
    SensorslistComponent,
    ApplicationsComponent,
    ApplicationComponent,
    DeviceselectordialogComponent,
    TriggerComponent,
    TriggerslistComponent,
    UserselectordialogComponent,
    ViewComponent,
    ViewslistComponent,
    ConfirmdialogComponent,
    MyviewsComponent,
    MyviewerComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    AppRoutingModule,
    AngularFireMessagingModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatSidenavModule,
    MatListModule,
    MatToolbarModule,
    MatChipsModule,
    MatTooltipModule,
    MatTableModule,
    MatSnackBarModule,
    MatSelectModule,
    MatDividerModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    // MatMenuModule,
    // MatDividerModule,
    // MatTabsModule,
    MatInputModule,
    // MatTableModule,
    // MatDialogModule,
    // MatSelectModule,
    // MatDatepickerModule,
    // MatMomentDateModule,
    AppRoutingModule,
    ReactiveFormsModule,
    GoogleChartsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirePerformanceModule,
    AngularFireAuthModule,
    // Allow offline operations - useful when used in combination with PWA functionality
    // AngularFirestoreModule,
    AngularFirestoreModule.enablePersistence(),
    AngularFireStorageModule,
    ServiceWorkerModule.register("ngsw-worker.js", {
      enabled: environment.production,
    }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
