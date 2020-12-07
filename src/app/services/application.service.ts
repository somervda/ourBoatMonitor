import { Injectable } from "@angular/core";
import { AngularFirestore, DocumentReference } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { Application } from "../models/application.model";
import { map, first } from "rxjs/operators";
import { convertSnap, convertSnaps, dbFieldUpdate } from "./db-utils";
import { HelperService } from "./helper.service";
@Injectable({
  providedIn: "root",
})
export class ApplicationService {
  collectionName = "applications";

  constructor(private afs: AngularFirestore, private helper: HelperService) {}

  /**
   * Find a Application doc by Application id
   * @param id Application Id
   */
  findById(id: string): Observable<Application> {
    return this.afs
      .doc("/" + this.collectionName + "/" + id)
      .snapshotChanges()
      .pipe(
        map((snap) => {
          return convertSnap<Application>(snap);
        }),
        first()
      );
  }

  /**
   * Find all Applications
   * @param pageSize The maximum number of Applications to return
   */
  findAll(pageSize: number): Observable<Application[]> {
    // console.log("Application findAll", pageSize);
    return this.afs
      .collection(this.collectionName, (ref) => ref.limit(pageSize))
      .snapshotChanges()
      .pipe(
        map((snaps) => {
          // console.log("find Applications", convertSnaps<Application>(snaps));
          return convertSnaps<Application>(snaps);
        })
      );
  }

  /**
   * Find all Applications where a user identified by uid is a member
   * @param uid The user ID
   * @param pageSize The maximum number of Applications to return
   */
  findByUid(uid: string, pageSize: number): Observable<Application[]> {
    const userRef = this.helper.docRef(`/users/${uid}`);
    // console.log("Application findByUid", pageSize, uid, userRef);

    return this.afs
      .collection(this.collectionName, (ref) =>
        ref.where("userRefs", "array-contains", userRef).limit(pageSize)
      )
      .snapshotChanges()
      .pipe(
        map((snaps) => {
          // console.log("find Applications", convertSnaps<Application>(snaps));
          return convertSnaps<Application>(snaps);
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

  create(application: Application): Promise<DocumentReference> {
    return this.afs.collection(this.collectionName).add(application);
  }

  delete(id: string): Promise<void> {
    return this.afs.collection(this.collectionName).doc(id).delete();
  }
}
