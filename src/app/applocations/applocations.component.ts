import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ApplicationService } from "../services/application.service";
import { Application } from "../models/application.model";
import { Subscription } from "rxjs";
import { EventService } from "../services/event.service";

@Component({
  selector: "app-applocations",
  templateUrl: "./applocations.component.html",
  styleUrls: ["./applocations.component.scss"],
})
export class ApplocationsComponent implements OnInit, OnDestroy {
  deviceEvent$$: Subscription;
  application: Application;
  deviceLocations: {
    deviceName: string;
    latitude: number;
    longitude: number;
    timestamp: firebase.firestore.Timestamp;
  }[] = [];
  constructor(
    private eventService: EventService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.application = this.route.snapshot.data["application"];
    // console.log("application", this.application);
    // Look up each device and get the last location
    this.application.deviceRefs.forEach((deviceRef) => {
      this.deviceEvent$$ = this.eventService
        .findRecentByDevice(deviceRef)
        .subscribe((events) => {
          if (events.length == 1) {
            this.deviceLocations.push({
              deviceName: events[0].deviceName,
              latitude: events[0].location.latitude,
              longitude: events[0].location.longitude,
              timestamp: <firebase.firestore.Timestamp>events[0].timestamp,
            });
          }
          // console.log("deviceLocations", this.deviceLocations);
        });
    });
  }

  ngOnDestroy() {
    if (this.deviceEvent$$) this.deviceEvent$$.unsubscribe();
  }
}
