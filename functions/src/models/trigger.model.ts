import * as admin from "firebase-admin";

export interface Trigger {
  id?: string;
  name: string;
  description: string;
  active: boolean;
  sensorRef: admin.firestore.DocumentReference;
  triggerRangeMin: number;
  triggerRangeMax: number;
  message: string;
  triggerAction: TriggerAction;
  // TargetRef is a user or usergroup
  targetRef?: admin.firestore.DocumentReference;
}

/**
 * Action to perform if a trigger is fired
 */
export enum TriggerAction {
  "Notification" = 1,
  "eMail" = 2,
  "Log" = 3,
  "SMS" = 4,
}

export interface TriggerActionInfoItem {
  value: number;
  name: string;
  nameShort: string;
}

export const TriggerActionInfo: TriggerActionInfoItem[] = [
  {
    value: 1,
    name: "Send a User Notification",
    nameShort: "Notification",
  },
  {
    value: 2,
    name: "Send a User EMail",
    nameShort: "EMail",
  },
  {
    value: 3,
    name: "Create a Log Entry",
    nameShort: "Log",
  },
  {
    value: 4,
    name: "Send a SMS notification",
    nameShort: "SMS",
  },
];
