import * as admin from "firebase-admin";
import { IotDataSource } from "./device.model";
import { UOM } from "./sensor.model";
export interface Event {
  id?: string;
  timestamp: Date | admin.firestore.FieldValue;
  location: admin.firestore.GeoPoint;
  geohash: string;
  sensorRef: admin.firestore.DocumentReference;
  uom: UOM;
  deviceRef: admin.firestore.DocumentReference;
  applicationRefs: admin.firestore.DocumentReference[];
  value: number;
  iotDataSource: IotDataSource;
  name: string;
  deviceName: string;
}
