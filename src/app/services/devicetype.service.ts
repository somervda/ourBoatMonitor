import { Injectable } from "@angular/core";
import { AngularFirestore, DocumentReference } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { Devicetype } from "../models/devicetype.model";
import { map, first } from "rxjs/operators";
import { convertSnap, convertSnaps, dbFieldUpdate } from "./db-utils";

@Injectable({
  providedIn: "root",
})
export class DevicetypeService {
  collectionName = "devicetypes";

  constructor(private afs: AngularFirestore) {}

  /**
   * Find a Devicetype doc by Devicetype id
   * @param id Devicetype Id
   */
  findById(id: string): Observable<Devicetype> {
    return this.afs
      .doc("/" + this.collectionName + "/" + id)
      .snapshotChanges()
      .pipe(
        map((snap) => {
          return convertSnap<Devicetype>(snap);
        }),
        first()
      );
  }

  /**
   * Find all Devicetypes
   * @param pageSize The maximum number of Devicetypes to return
   */
  findAll(pageSize: number): Observable<Devicetype[]> {
    // console.log("Devicetype findAll", pageSize);
    return this.afs
      .collection(this.collectionName, (ref) => ref.limit(pageSize))
      .snapshotChanges()
      .pipe(
        map((snaps) => {
          // console.log("find Devicetypes", convertSnaps<Devicetype>(snaps));
          return convertSnaps<Devicetype>(snaps);
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

  create(Devicetype: Devicetype): Promise<DocumentReference> {
    return this.afs.collection(this.collectionName).add(Devicetype);
  }

  delete(id: string): Promise<void> {
    return this.afs.collection(this.collectionName).doc(id).delete();
  }
}
