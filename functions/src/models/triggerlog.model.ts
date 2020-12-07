import * as admin from "firebase-admin";

export interface Triggerlog {
  id?: string;
  timestamp: Date | admin.firestore.FieldValue;
  triggerRef: admin.firestore.DocumentReference;
  eventRef: admin.firestore.DocumentReference;
}
