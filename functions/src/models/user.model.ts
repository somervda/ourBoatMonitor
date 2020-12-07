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
  // The Firebase Cloud Messaging (FCM) tokens registered for device
  // Note: Only one user can be associated with a certain device
  deviceMessagingToken?: string;
  smsPhoneE164?: string;
}
