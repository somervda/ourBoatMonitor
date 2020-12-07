import { TriggerComponent } from "./trigger/trigger.component";
import { DeviceComponent } from "./device/device.component";
import { DevicetypeResolver } from "./services/devicetype-resolver";
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { NotfoundComponent } from "./notfound/notfound.component";
import { AboutComponent } from "./about/about.component";
import { LoginComponent } from "./login/login.component";
import { UsersComponent } from "./users/users.component";
import { UserComponent } from "./user/user.component";
import { UserResolver } from "./services/user-resolver";
import { NotauthorizedComponent } from "./notauthorized/notauthorized.component";
import { permissionGuard } from "./guards/permission.guard";
import { DevicetypesComponent } from "./devicetypes/devicetypes.component";
import { DevicetypeComponent } from "./devicetype/devicetype.component";
import { DevicesComponent } from "./devices/devices.component";
import { DeviceResolver } from "./services/device-resolver";
import { SensorComponent } from "./sensor/sensor.component";
import { SensorResolver } from "./services/sensor-resolver";
import { ApplicationsComponent } from "./applications/applications.component";
import { ApplicationComponent } from "./application/application.component";
import { ApplicationResolver } from "./services/application-resolver";
import { TriggerResolver } from "./services/trigger-resolver";
import { ViewComponent } from "./view/view.component";
import { ViewResolver } from "./services/view-resolver";
import { MyviewsComponent } from "./myviews/myviews.component";
import { MyviewerComponent } from "./myviewer/myviewer.component";

const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "about", component: AboutComponent },
  { path: "login", component: LoginComponent },
  { path: "notAuthorized", component: NotauthorizedComponent },
  //  Applications
  {
    path: "applications",
    component: ApplicationsComponent,
    canActivate: [permissionGuard],
    data: { permissions: ["isAdmin"] },
  },
  {
    path: "application/create",
    component: ApplicationComponent,
    canActivate: [permissionGuard],
    data: { permissions: ["isAdmin"] },
  },
  {
    path: "application/:id/delete",
    component: ApplicationComponent,
    resolve: { application: ApplicationResolver },
    canActivate: [permissionGuard],
    data: { permissions: ["isAdmin"] },
    runGuardsAndResolvers: "always",
  },
  {
    path: "application/:id",
    component: ApplicationComponent,
    resolve: { application: ApplicationResolver },
    canActivate: [permissionGuard],
    data: { permissions: ["isAdmin"] },
    runGuardsAndResolvers: "always",
  },

  //  Devices
  {
    path: "devices",
    component: DevicesComponent,
    canActivate: [permissionGuard],
    data: { permissions: ["isAdmin"] },
  },
  {
    path: "device/create",
    component: DeviceComponent,
    canActivate: [permissionGuard],
    data: { permissions: ["isAdmin"] },
  },
  {
    path: "device/:id/delete",
    component: DeviceComponent,
    resolve: { device: DeviceResolver },
    canActivate: [permissionGuard],
    data: { permissions: ["isAdmin"] },
    runGuardsAndResolvers: "always",
  },
  {
    path: "device/:id",
    component: DeviceComponent,
    resolve: { device: DeviceResolver },
    canActivate: [permissionGuard],
    data: { permissions: ["isAdmin"] },
    runGuardsAndResolvers: "always",
  },
  //  Devicetypes
  {
    path: "devicetypes",
    component: DevicetypesComponent,
    canActivate: [permissionGuard],
    data: { permissions: ["isAdmin"] },
  },
  {
    path: "devicetype/create",
    component: DevicetypeComponent,
    canActivate: [permissionGuard],
    data: { permissions: ["isAdmin"] },
  },
  {
    path: "devicetype/:id/delete",
    component: DevicetypeComponent,
    resolve: { devicetype: DevicetypeResolver },
    canActivate: [permissionGuard],
    data: { permissions: ["isAdmin"] },
    runGuardsAndResolvers: "always",
  },
  {
    path: "devicetype/:id",
    component: DevicetypeComponent,
    resolve: { devicetype: DevicetypeResolver },
    canActivate: [permissionGuard],
    data: { permissions: ["isAdmin"] },
    runGuardsAndResolvers: "always",
  },
  //  My Views
  {
    path: "myviews",
    component: MyviewsComponent,
    canActivate: [permissionGuard],
    data: { permissions: ["isActivated"] },
  },
  //  My Viewer
  {
    path: "application/:aid/myviewer/:vid",
    resolve: { view: ViewResolver },
    component: MyviewerComponent,
    canActivate: [permissionGuard],
    data: { permissions: ["isActivated"] },
  },
  //  Sensor
  {
    path: "devicetype/:did/sensor/create",
    component: SensorComponent,
    canActivate: [permissionGuard],
    data: { permissions: ["isAdmin"] },
  },
  {
    path: "devicetype/:did/sensor/:sid/delete",
    component: SensorComponent,
    resolve: { sensor: SensorResolver },
    canActivate: [permissionGuard],
    data: { permissions: ["isAdmin"] },
    runGuardsAndResolvers: "always",
  },
  {
    path: "devicetype/:did/sensor/:sid",
    component: SensorComponent,
    resolve: { sensor: SensorResolver },
    canActivate: [permissionGuard],
    data: { permissions: ["isAdmin"] },
    runGuardsAndResolvers: "always",
  },
  //  Trigger
  {
    path: "application/:aid/trigger/create",
    component: TriggerComponent,
    canActivate: [permissionGuard],
    data: { permissions: ["isAdmin"] },
  },
  {
    path: "application/:aid/trigger/:tid/delete",
    component: TriggerComponent,
    resolve: { trigger: TriggerResolver },
    canActivate: [permissionGuard],
    data: { permissions: ["isAdmin"] },
    runGuardsAndResolvers: "always",
  },
  {
    path: "application/:aid/trigger/:tid",
    component: TriggerComponent,
    resolve: { trigger: TriggerResolver },
    canActivate: [permissionGuard],
    data: { permissions: ["isAdmin"] },
    runGuardsAndResolvers: "always",
  },
  //  Users
  {
    path: "users",
    component: UsersComponent,
    canActivate: [permissionGuard],
    data: { permissions: ["isAdmin"] },
  },
  {
    path: "user/:uid",
    component: UserComponent,
    resolve: { user: UserResolver },
    canActivate: [permissionGuard],
    data: { permissions: ["isActivated"] },
    runGuardsAndResolvers: "always",
  },
  {
    path: "myprofile/:uid",
    component: UserComponent,
    resolve: { user: UserResolver },
    canActivate: [permissionGuard],
    data: { permissions: ["isActivated"] },
    runGuardsAndResolvers: "always",
  },

  //  View
  {
    path: "application/:aid/view/create",
    component: ViewComponent,
    canActivate: [permissionGuard],
    data: { permissions: ["isAdmin"] },
  },
  {
    path: "application/:aid/view/:vid/delete",
    component: ViewComponent,
    resolve: { view: ViewResolver },
    canActivate: [permissionGuard],
    data: { permissions: ["isAdmin"] },
    runGuardsAndResolvers: "always",
  },
  {
    path: "application/:aid/view/:vid",
    component: ViewComponent,
    resolve: { view: ViewResolver },
    canActivate: [permissionGuard],
    data: { permissions: ["isAdmin"] },
    runGuardsAndResolvers: "always",
  },

  //  Other
  { path: "notfound", component: NotfoundComponent },
  { path: "**", component: NotfoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: "reload", relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
