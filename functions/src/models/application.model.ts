import * as admin from "firebase-admin";
export interface Application {
  id?: string;
  name: string;
  description: string;
  deviceRefs: admin.firestore.DocumentReference[];
  userRefs: admin.firestore.DocumentReference[];
}
