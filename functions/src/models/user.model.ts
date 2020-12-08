import * as admin from "firebase-admin";

export interface User {
  uid: string;
  email: string;
  photoURL?: string;
  displayName?: string;
  // Date and time the user first logged into the application (used for aging)
  dateCreated?: Date | admin.firestore.FieldValue;
  dateLastLogon?: Date | admin.firestore.FieldValue;

  // Simple Authorization scheme
  isAdmin?: Boolean;
  // Indicates the user has administration rights including ability to
  // set a users roles
  isActivated?: Boolean;
  smsPhoneE164?: string;
}
