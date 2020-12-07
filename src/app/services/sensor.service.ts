import { Injectable } from "@angular/core";
import { AngularFirestore, DocumentReference } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { Sensor } from "../models/sensor.model";
import { map, first } from "rxjs/operators";
import { convertSnap, convertSnaps, dbFieldUpdate } from "./db-utils";

@Injectable({
  providedIn: "root",
})
export class SensorService {
  parentCollectionName = "devicetypes";
  collectionName = "sensors";

  constructor(private afs: AngularFirestore) {}

  /**
   * Find a Sensor doc by a devicestype id and Sensor id
   * @param did Devicetype Id
   * @param sid Sensor Id
   */
  findById(did: string, sid: string): Observable<Sensor> {
    return this.afs
      .doc(
        "/" +
          this.parentCollectionName +
          "/" +
          did +
          "/" +
          this.collectionName +
          "/" +
          sid
      )
      .snapshotChanges()
      .pipe(
        map((snap) => {
          return convertSnap<Sensor>(snap);
        }),
        first()
      );
  }

  /**
   * Find all Sensors for a devicetype
   * @param did Devicetype id
   * @param pageSize The maximum number of Sensors to return
   */
  findAll(did: string, pageSize: number): Observable<Sensor[]> {
    // console.log("Sensor findAll", did, pageSize);
    return this.afs
      .collection(
        "/" + this.parentCollectionName + "/" + did + "/" + this.collectionName,
        (ref) => ref.limit(pageSize)
      )
      .snapshotChanges()
      .pipe(
        map((snaps) => {
          // console.log("find Sensors", convertSnaps<Sensor>(snaps));
          return convertSnaps<Sensor>(snaps);
        })
      );
  }

  fieldUpdate(did: string, sid: string, fieldName: string, newValue: any) {
    if (did && sid && fieldName) {
      const updateObject = {};
      dbFieldUpdate(
        "/" +
          this.parentCollectionName +
          "/" +
          did +
          "/" +
          this.collectionName +
          "/" +
          sid,
        fieldName,
        newValue,
        this.afs
      );
    }
  }

  create(did: string, sensor: Sensor): Promise<DocumentReference> {
    return this.afs
      .collection(
        "/" + this.parentCollectionName + "/" + did + "/" + this.collectionName
      )
      .add(sensor);
  }

  delete(did: string, sid: string): Promise<void> {
    return this.afs
      .collection(
        "/" + this.parentCollectionName + "/" + did + "/" + this.collectionName
      )
      .doc(sid)
      .delete();
  }
}
