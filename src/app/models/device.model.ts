import { DocumentReference } from "@angular/fire/firestore";

export interface Device {
  id?: string;
  name: string;
  description: string;
  deviceId: string;
  iotDataSource: IotDataSource;
  deviceTypeRef: DocumentReference;
  // location: firebase.firestore.GeoPoint;
  // Using discrete lat/lng for this, only use geopoint for events when I
  // don't need to edit them separately
  latitude: number;
  longitude: number;
  geoHash: string;
}

export enum IotDataSource {
  "TheThingsNetwork" = 1,
  "SigFox" = 2,
  "Direct" = 4,
  "Hologram" = 5,
  "curl" = 6,
}

export interface IotDataSourceInfoItem {
  iotDataSource: IotDataSource;
  name: string;
  nameShort: string;
}

export const IotDataSourceInfo: IotDataSourceInfoItem[] = [
  {
    iotDataSource: IotDataSource.TheThingsNetwork,
    name: "The Things Network",
    nameShort: "TTN",
  },
  {
    iotDataSource: IotDataSource.SigFox,
    name: "SigFox",
    nameShort: "SigFox",
  },
  {
    iotDataSource: IotDataSource.Direct,
    name: "Direct internet connection from device",
    nameShort: "Direct",
  },
  {
    iotDataSource: IotDataSource.Hologram,
    name: "Hologram",
    nameShort: "Hologram",
  },
  {
    iotDataSource: IotDataSource.curl,
    name: "curl interface for testing",
    nameShort: "curl",
  },
];
