import { DocumentReference } from "@angular/fire/firestore";

export interface Application {
  id?: string;
  name: string;
  description: string;
  deviceRefs: DocumentReference[];
  userRefs: DocumentReference[];
}
