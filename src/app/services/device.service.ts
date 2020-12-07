import { Injectable } from "@angular/core";
import { AngularFirestore, DocumentReference } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { Device } from "../models/device.model";
import { map, first } from "rxjs/operators";
import { convertSnap, convertSnaps, dbFieldUpdate } from "./db-utils";

@Injectable({
  providedIn: "root",
})
export class DeviceService {
  collectionName = "devices";

  constructor(private afs: AngularFirestore) {}

  /**
   * Find a Device doc by Device id
   * @param id Device Id
   */
  findById(id: string): Observable<Device> {
    return this.afs
      .doc("/" + this.collectionName + "/" + id)
      .snapshotChanges()
      .pipe(
        map((snap) => {
          return convertSnap<Device>(snap);
        }),
        first()
      );
  }

  /**
   * Find all Devices
   * @param pageSize The maximum number of Devices to return
   */
  findAll(pageSize: number): Observable<Device[]> {
    // console.log("Device findAll", pageSize);
    return this.afs
      .collection(this.collectionName, (ref) => ref.limit(pageSize))
      .snapshotChanges()
      .pipe(
        map((snaps) => {
          // console.log("find Devices", convertSnaps<Device>(snaps));
          return convertSnaps<Device>(snaps);
        })
      );
  }

  fieldUpdate(docId: string, fieldName: string, newValue: any) {
    if (docId && fieldName) {
      const updateObject = {};
      dbFieldUpdate(
        "/" + this.collectionName + "/" + docId,
        fieldName,
        newValue,
        this.afs
      );
    }
  }

  create(device: Device): Promise<DocumentReference> {
    return this.afs.collection(this.collectionName).add(device);
  }

  delete(id: string): Promise<void> {
    return this.afs.collection(this.collectionName).doc(id).delete();
  }
}
