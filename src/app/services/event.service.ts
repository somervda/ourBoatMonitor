import { Injectable } from "@angular/core";
import { AngularFirestore, DocumentReference } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { Event } from "../models/event.model";
import { map, first } from "rxjs/operators";
import { convertSnap, convertSnaps, dbFieldUpdate } from "./db-utils";

@Injectable({
  providedIn: "root",
})
export class EventService {
  collectionName = "events";

  constructor(private afs: AngularFirestore) {}

  /**
   * Find events that have matching application reference and sensor reference
   * @param applicationRef A document reference to an application
   * @param sensorRef A document reference to a sensor
   * @param pageSize
   */
  findByApplicationSensor(
    applicationRef: DocumentReference,
    sensorRef: DocumentReference,
    pageSize: number
  ): Observable<Event[]> {
    return this.afs
      .collection(this.collectionName, (ref) =>
        ref
          .where("applicationRefs", "array-contains", applicationRef)
          .where("sensorRef", "==", sensorRef)
          .orderBy("timestamp", "desc")
          .limit(pageSize)
      )
      .snapshotChanges()
      .pipe(
        map((snaps) => {
          // console.log("find Events", convertSnaps<Event>(snaps));
          return convertSnaps<Event>(snaps);
        })
      );
  }
}
