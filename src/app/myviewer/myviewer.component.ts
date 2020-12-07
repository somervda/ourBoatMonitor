import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Observable, Subscription } from "rxjs";
import { Event } from "../models/event.model";
import { View, ViewType, ViewTypeInfo } from "../models/view.model";
import { DeviceService } from "../services/device.service";
import { EventService } from "../services/event.service";
import { HelperService } from "../services/helper.service";

@Component({
  selector: "app-myviewer",
  templateUrl: "./myviewer.component.html",
  styleUrls: ["./myviewer.component.scss"],
})
export class MyviewerComponent implements OnInit, OnDestroy {
  devices: { id: string; name: string }[] = [];
  ViewType = ViewType;
  viewType: ViewType;
  maxRows: number = 25;
  ViewTypeInfo = ViewTypeInfo;
  events$: Observable<Event[]>;
  events$$: Subscription;
  devices$$: Subscription;
  view: View;
  aid: string;

  // Google Charts
  showChart = false;
  chartType = "";
  chartColumns: string[] = [];
  chartOptions = {
    legend: { position: "bottom" },
    chartArea: { width: "90%", height: "70%" },
  };
  chartData = [];

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    private helper: HelperService,
    private deviceService: DeviceService
  ) {}

  async ngOnInit() {
    this.view = this.route.snapshot.data["view"];
    // Set the viewType, initially, to the view's  view type.
    this.viewType = this.view.viewType;
    this.aid = this.route.snapshot.paramMap.get("aid");
    // Load up the devices array  devices associated with the application
    // Used for resolving device names
    this.devices$$ = await this.deviceService.findAll(100).subscribe((devices) => {
      devices.forEach((device) => this.devices.push({ id: device.id, name: device.name }));
    });

    this.chartProcessor();
  }

  onOptionChange() {
    this.chartProcessor();
  }

  /**
   * Retrieve events and display as a google chart
   *
   */
  async chartProcessor() {
    this.showChart = false;
    // Set the chart type - see https://www.tutorialspoint.com/angular_googlecharts/index.htm
    switch (this.viewType) {
      case ViewType.scatter: {
        this.chartType = "ScatterChart";
        break;
      }
      case ViewType.line: {
        this.chartType = "LineChart";
        break;
      }
      case ViewType.table: {
        this.chartType = "Table";
        break;
      }
    }

    this.devices = [];
    this.chartData = [];
    this.chartColumns = [];

    // Load the devices array  devices associated with the application
    this.devices$$ = await this.deviceService
      .findAll(100)
      .subscribe((devices) => {
        devices.forEach((device) =>
          this.devices.push({ id: device.id, name: device.name })
        );
      });

    // Get an observable of the event data for the chart
    this.events$ = this.eventService.findByApplicationSensor(
      this.helper.docRef(`applications/${this.aid}`),
      this.view.sensorRef,
      this.maxRows
    );

    // Build google chart data
    let rawData: { timestamp: Date; deviceName: string; value: number }[] = [];
    let series: string[] = [];

    this.events$$ = await this.events$.subscribe(async (events) => {
      await events.map(async (event) => {
        const deviceName = this.devices.find((device) => device.id == event.deviceRef.id)
          ?.name;
        if (!series.includes(deviceName)) {
          series.push(deviceName);
        }

        rawData.push({
          timestamp: (<firebase.firestore.Timestamp>event.timestamp).toDate(),
          deviceName: deviceName,
          value: event.value,
        });
      });
      this.rawToChartData(series, rawData);
      this.showChart = true;
    });
  }

  rawToChartData(
    series: string[],
    rawData: { timestamp: Date; deviceName: string; value: number }[]
  ) {
    // Order the rawData by deviceName, this will result in line charts
    // adding lines between all points for a particular series (Series is represented as a column of data)
    rawData.sort((a, b) => a.deviceName.localeCompare(b.deviceName));
    // Create the chartColumns and chartData arrays
    this.chartColumns.push("Date");
    series.forEach((columnName) => {
      // For each series add a column name and any data for the series
      // missing column data is represented by a null
      this.chartColumns.push(columnName);
    });

    // Create chartData rows for each row of raw data
    rawData.forEach((rawDataRow) => {
      let chartDataRow: any[] = [];
      chartDataRow.push(rawDataRow.timestamp);
      series.forEach((columnName) => {
        if (columnName == rawDataRow.deviceName) {
          chartDataRow.push(rawDataRow.value);
        } else {
          // Use null to indicate to google charts that no point is to be drawn
          chartDataRow.push(null);
        }
      });
      this.chartData.push(chartDataRow);
    });
  }

  ngOnDestroy() {
    if (this.events$$) {
      this.events$$.unsubscribe();
    }
    if (this.devices$$) {
      this.devices$$.unsubscribe();
    }
  }
}
