import { AngularFirestore } from "@angular/fire/firestore";
import * as firebase from "firebase";

export function convertSnaps<T>(snaps) {
  return <T[]>snaps.map((snap) => {
    return {
      id: snap.payload.doc.id,
      ...snap.payload.doc.data(),
    };
  });
}

// Convert snap converts a single documentsnapshot into a single item of type T
export function convertSnap<T>(snap) {
  // console.log("snap", snap);
  return <T>{
    id: snap.payload.id,
    ...snap.payload.data(),
  };
}

export function dbFieldUpdate(
  docPath: string,
  fieldName: string,
  newValue: any,
  db: AngularFirestore
) {
  if (docPath && fieldName) {
    // console.log("dbFieldUpdate: ", docPath, fieldName, newValue);
    let updateObject = {};
    updateObject[fieldName] = newValue;
    // Always update the dateUpdated field
    updateObject[
      "dateUpdated"
    ] = firebase.firestore.FieldValue.serverTimestamp();
    // console.log(updateObject);
    db.doc(docPath)
      .update(updateObject)
      .then((data) => {
        // console.log(fieldName + " updated");
      })
      .catch((error) =>
        console.log(docPath + ":" + fieldName + " update error ", error)
      );
  }
}

export function dbFieldUpdateAsPromise(
  docPath: string,
  fieldName: string,
  newValue: any,
  db: AngularFirestore
): Promise<void> {
  if (docPath && fieldName) {
    // console.log("dbFieldUpdate: ", docPath, fieldName, newValue);
    let updateObject = {};
    updateObject[fieldName] = newValue;
    // Always update the dateUpdated
    updateObject[
      "dateUpdated"
    ] = firebase.firestore.FieldValue.serverTimestamp();
    // console.log(updateObject);
    return db.doc(docPath).update(updateObject);
  } else {
    return null;
  }
}
