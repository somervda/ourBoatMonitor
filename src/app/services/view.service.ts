import { Injectable } from "@angular/core";
import { AngularFirestore, DocumentReference } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { View } from "../models/view.model";
import { map, first } from "rxjs/operators";
import { convertSnap, convertSnaps, dbFieldUpdate } from "./db-utils";

@Injectable({
  providedIn: "root",
})
export class ViewService {
  parentCollectionName = "applications";
  collectionName = "views";

  constructor(private afs: AngularFirestore) {}

  /**
   * Find a View doc by a application id and View id
   * @param aid Application Id
   * @param vid View Id
   */
  findById(aid: string, vid: string): Observable<View> {
    return this.afs
      .doc(
        "/" +
          this.parentCollectionName +
          "/" +
          aid +
          "/" +
          this.collectionName +
          "/" +
          vid
      )
      .snapshotChanges()
      .pipe(
        map((snap) => {
          return convertSnap<View>(snap);
        }),
        first()
      );
  }

  /**
   * Find all Views for a application
   * @param aid Application id
   * @param pageSize The maximum number of Views to return
   */
  findAll(aid: string, pageSize: number): Observable<View[]> {
    // console.log("View findAll", aid, pageSize);
    return this.afs
      .collection(
        "/" + this.parentCollectionName + "/" + aid + "/" + this.collectionName,
        (ref) => ref.limit(pageSize)
      )
      .snapshotChanges()
      .pipe(
        map((snaps) => {
          // console.log("find Views", convertSnaps<View>(snaps));
          return convertSnaps<View>(snaps);
        })
      );
  }

  fieldUpdate(aid: string, vid: string, fieldName: string, newValue: any) {
    if (aid && vid && fieldName) {
      const updateObject = {};
      dbFieldUpdate(
        "/" +
          this.parentCollectionName +
          "/" +
          aid +
          "/" +
          this.collectionName +
          "/" +
          vid,
        fieldName,
        newValue,
        this.afs
      );
    }
  }

  create(aid: string, view: View): Promise<DocumentReference> {
    return this.afs
      .collection(
        "/" + this.parentCollectionName + "/" + aid + "/" + this.collectionName
      )
      .add(view);
  }

  delete(aid: string, vid: string): Promise<void> {
    return this.afs
      .collection(
        "/" + this.parentCollectionName + "/" + aid + "/" + this.collectionName
      )
      .doc(vid)
      .delete();
  }
}
