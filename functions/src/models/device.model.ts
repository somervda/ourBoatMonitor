import * as admin from "firebase-admin";

export interface Device {
  id?: string;
  name: string;
  description: string;
  deviceId: string;
  iotDataSource: IotDataSource;
  deviceTypeRef: admin.firestore.DocumentReference;
  // location: firebase.firestore.GeoPoint;
  // Using discrete lat/lng for this, only use geopoint for events when I
  // don't need to edit them separately
  latitude: number;
  longitude: number;
  geoHash: string;
}

export enum IotDataSource {
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
