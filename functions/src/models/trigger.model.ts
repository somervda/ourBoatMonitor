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
  // Governor on how often alerts can be sent
  // in seconds. If a trigger fires and the delay
  // period has not elapsed since the last trigger
  // then no alert is sent.
  delayBetweenActions?: number;
  // Last time the trigger resulted in the action
  lastActionTimestamp?: admin.firestore.Timestamp;
}

/**
 * Action to perform if a trigger is fired
 */
export enum TriggerAction {
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
