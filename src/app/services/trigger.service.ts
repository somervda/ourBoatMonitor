import { Injectable } from "@angular/core";
import { AngularFirestore, DocumentReference } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { Trigger } from "../models/trigger.model";
import { map, first } from "rxjs/operators";
import { convertSnap, convertSnaps, dbFieldUpdate } from "./db-utils";

@Injectable({
  providedIn: "root",
})
export class TriggerService {
  parentCollectionName = "applications";
  collectionName = "triggers";

  constructor(private afs: AngularFirestore) {}

  /**
   * Find a Trigger doc by a application id and Trigger id
   * @param aid Application Id
   * @param tid Trigger Id
   */
  findById(aid: string, tid: string): Observable<Trigger> {
    return this.afs
      .doc(
        "/" +
          this.parentCollectionName +
          "/" +
          aid +
          "/" +
          this.collectionName +
          "/" +
          tid
      )
      .snapshotChanges()
      .pipe(
        map((snap) => {
          return convertSnap<Trigger>(snap);
        }),
        first()
      );
  }

  /**
   * Find all Triggers for a application
   * @param aid Application id
   * @param pageSize The maximum number of Triggers to return
   */
  findAll(aid: string, pageSize: number): Observable<Trigger[]> {
    // console.log("Trigger findAll", aid, pageSize);
    return this.afs
      .collection(
        "/" + this.parentCollectionName + "/" + aid + "/" + this.collectionName,
        (ref) => ref.limit(pageSize)
      )
      .snapshotChanges()
      .pipe(
        map((snaps) => {
          // console.log("find Triggers", convertSnaps<Trigger>(snaps));
          return convertSnaps<Trigger>(snaps);
        })
      );
  }

  fieldUpdate(aid: string, tid: string, fieldName: string, newValue: any) {
    if (aid && tid && fieldName) {
      const updateObject = {};
      dbFieldUpdate(
        "/" +
          this.parentCollectionName +
          "/" +
          aid +
          "/" +
          this.collectionName +
          "/" +
          tid,
        fieldName,
        newValue,
        this.afs
      );
    }
  }

  create(aid: string, trigger: Trigger): Promise<DocumentReference> {
    return this.afs
      .collection(
        "/" + this.parentCollectionName + "/" + aid + "/" + this.collectionName
      )
      .add(trigger);
  }

  delete(aid: string, tid: string): Promise<void> {
    return this.afs
      .collection(
        "/" + this.parentCollectionName + "/" + aid + "/" + this.collectionName
      )
      .doc(tid)
      .delete();
  }
}
