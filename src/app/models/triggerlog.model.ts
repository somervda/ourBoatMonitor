import { DocumentReference } from "@angular/fire/firestore";

export interface Triggerlog {
  id?: string;
  timestamp: Date | firebase.firestore.FieldValue;
  triggerRef: DocumentReference;
  eventRef: DocumentReference;
}
