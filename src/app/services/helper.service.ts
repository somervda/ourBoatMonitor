import { Injectable, NgZone } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { AngularFirestore, DocumentReference } from "@angular/fire/firestore";
import { map } from "rxjs/operators";
import { convertSnap } from "./db-utils";
import { Observable } from "rxjs";
import { firestore } from "firebase";

@Injectable({
  providedIn: "root",
})
export class HelperService {
  constructor(
    private snackBar: MatSnackBar,
    private ngZone: NgZone,
    private router: Router,
    private afs: AngularFirestore
  ) {}

  /**
   * Simplified version of snackbar
   * @param msg Message to display in the snackBar
   * @param ms Number of milliseconds to display the snackbar
   */
  snackbar(msg: string, ms: number, url?: string) {
    this.snackBar.open(msg, "", {
      duration: ms,
    });
  }

  /**
   * Helper function to display both a snackbar and optionally
   * route the user to another component.
   * @param url Optional: URL to a new route
   */
  redirect(url: string) {
    this.ngZone.run(() => this.router.navigateByUrl(url));
  }

  docRef(path: string): DocumentReference {
    return this.afs.doc(path).ref;
  }

  getDocRefId(docRef: DocumentReference): string {
    let id = undefined;
    if (docRef && docRef.path) {
      id = /[^/]*$/.exec(docRef.path)[0];
    }
    // console.log("getDocRefId", docRef, docRef.path, " id:", id);

    return id;
  }

  /**
   * Returns an observable of the document represented by the
   * docRef. Note: Used by the doc pipe.
   * @param docRef a firestore.DocumentReference
   */
  getDocRef<T>(docRef: firestore.DocumentReference<T>): Observable<T> {
    if (docRef && docRef != null && docRef.path && docRef.path != null) {
      return this.afs
        .doc(docRef.path)
        .snapshotChanges()
        .pipe(
          map((snap) => {
            // console.log("transform snap", convertSnap<T>(snap));
            return convertSnap<T>(snap);
          })
        );
    }
  }
}
