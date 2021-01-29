import { db } from "./init";
import { Event } from "./models/event.model";
import { Application } from "./models/application.model";
import { Trigger, TriggerAction } from "./models/trigger.model";
import { Triggerlog } from "./models/triggerlog.model";
import { User } from "./models/user.model";
import { UOMInfo } from "./models/sensor.model";
import * as admin from "firebase-admin";
import * as twilio from "twilio";
import * as functions from "firebase-functions";
import * as nodemailer from "nodemailer";

// Note: Config settings see https://firebase.google.com/docs/functions/config-env  are used for
// the following values
// firebase functions:config:set iotauthentication.header="xxxxxxxxxxxxxxxxxxxxxxxxx"
// firebase functions:config:set email.user="xxxxxxxxxxxxxxxxxxxxxx"
// firebase functions:config:set email.password="xxxxxxxxxxxxxxxxxxxxxx"
// firebase functions:config:set twilio.ssid="xxxxxxxxxxxxxxxxxxxxxxxxx"
// firebase functions:config:set twilio.authtoken="xxxxxxxxxxxxxxxxxxxxxxxxx"
// firebase functions:config:set twilio.phone="xxxxxxxxxxxxxxxxxx"

export const eventTrigger = function (event: Event) {
  console.log("eventTrigger", JSON.stringify(event));
  event.applicationRefs.forEach((e) => {
    e.get()
      .then((a) => {
        const application: Application = <Application>{ id: a.id, ...a.data() };
        // console.log("appRef:", JSON.stringify(application));
        processTriggers(event, application);
      })
      .catch();
  });
};

function processTriggers(event: Event, application: Application) {
  const triggerCollectionPath = `applications/${application.id}/triggers`;
  const triggerCollectionRef = <FirebaseFirestore.CollectionReference>(
    db.collection(triggerCollectionPath)
  );
  // console.log(
  //   "triggerCollectionRef:",
  //   triggerCollectionPath,
  //   " ref:",
  //   JSON.stringify(triggerCollectionRef)
  // );
  triggerCollectionRef
    .where("sensorRef", "==", event.sensorRef)
    .where("active", "==", true)
    .get()
    .then((triggerSnaps) => {
      triggerSnaps.forEach((triggerSnap) => {
        // We found a matching, active, trigger for this application and sensor
        const trigger: Trigger = <Trigger>{
          id: triggerSnap.id,
          ...triggerSnap.data(),
        };
        console.log("trigger:", JSON.stringify(trigger));
        // Check if event value is within the required trigger range
        if (
          event.value >= trigger.triggerRangeMin &&
          event.value <= trigger.triggerRangeMax
        ) {
          processTrigger(event, application, trigger);
        }
      });
    })
    .catch();
}

function processTrigger(
  event: Event,
  application: Application,
  trigger: Trigger
) {
  // Check to see that trigger delayBetweenActions governance is
  // Meet before processing the trigger (To stop too many messages being sent and filling someones SMS or mailbox)
  let suppressAction = false;
  if (trigger.delayBetweenActions && trigger.lastActionTimestamp) {
    let secondsDiff =
      admin.firestore.Timestamp.fromDate(new Date()).seconds -
      trigger.lastActionTimestamp.seconds;
    // console.log(
    //   "Trigger action check Diff:",
    //   secondsDiff,
    //   "delayBetweenActions:",
    //   trigger.delayBetweenActions,
    //   " Now:",
    //   admin.firestore.Timestamp.fromDate(new Date()).seconds,
    //   " lastActionTimestamp:",
    //   trigger.lastActionTimestamp.seconds
    // );
    if (secondsDiff < trigger.delayBetweenActions) {
      suppressAction = true;
      console.log("Trigger action suppressed:", secondsDiff);
    }
  }
  if (!suppressAction) {
    // Process the trigger action, note a log is always done
    writeTriggerLog(event, application, trigger);

    //  The following actions are performed for each application user
    application.userRefs.forEach((userRef) => {
      userRef
        .get()
        .then((userSnap) => {
          const user = <User>userSnap.data();
          //  Perform trigger action
          switch (trigger.triggerAction) {
            case TriggerAction.eMail:
              // send an email to the application users
              sendEmail(trigger, event, user);
              break;
            case TriggerAction.SMS:
              // Send a notification to each application user
              sendSMS(trigger, event, user);
              break;
          }
        })
        .catch();
    });
  }
}

/**
 * Write an entry to trigger log every time a trigger is fired
 * also update the trigger with the timestamp of when the trigger fired
 * @param event IOT event details
 * @param application Application in scope for the event
 * @param trigger Trigger that applies for the event/application
 */
function writeTriggerLog(
  event: Event,
  application: Application,
  trigger: Trigger
) {
  const triggerPath = `applications/${application.id}/triggers/${trigger.id}`;
  const triggerRef = <FirebaseFirestore.DocumentReference>db.doc(triggerPath);
  const eventPath = `events/${event.id}`;
  const eventRef = <FirebaseFirestore.DocumentReference>db.doc(eventPath);
  const triggerlog: Triggerlog = {
    timestamp: admin.firestore.Timestamp.fromDate(new Date()),
    triggerRef: triggerRef,
    eventRef: eventRef,
  };
  console.log("triggerlog to write", JSON.stringify(triggerlog));
  db.collection("triggerlogs").add(triggerlog);
  // Also update the trigger with timestamp of last time it fired
  db.collection("applications")
    .doc(application.id)
    .collection("triggers")
    .doc(trigger.id)
    .update({
      lastActionTimestamp: admin.firestore.Timestamp.fromDate(new Date()),
    });
}

/**
 * Send a SMS to a user via the twilio service
 * @param trigger The trigger that invoked this action
 * @param event The IOT event document
 * @param user The user who should receive this SMS
 */
function sendSMS(trigger: Trigger, event: Event, user: User) {
  console.log(
    "sendSMS user:",
    JSON.stringify(user),
    "  trigger:",
    JSON.stringify(trigger)
  );
  if (user.smsPhoneE164 && user.smsPhoneE164.trim() !== "") {
    // Get twilio connection info from cloud function environment settings
    const twilioPhone = functions.config().twilio.phone;
    const twilioSID = functions.config().twilio.sid;
    const twilioAuthToken = functions.config().twilio.authtoken;
    const twilioClient = twilio(twilioSID, twilioAuthToken, {
      lazyLoading: true,
    });
    twilioClient.messages
      .create({
        body: trigger.message + " " + event.deviceName,
        from: twilioPhone,
        to: user.smsPhoneE164,
      })
      .then((message) =>
        console.log("Message sent:", JSON.stringify(message.sid))
      )
      .catch((e) => console.error("SMS send error:", e));
  }
}

/**
 * Send a email to a user via the nodemail service
 * @param trigger The trigger that invoked this action
 * @param event The IOT event document
 * @param user The user who should receive this SMS
 */
function sendEmail(trigger: Trigger, event: Event, user: User) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: functions.config().email.user,
      pass: functions.config().email.password,
    },
  });

  console.log(
    "sendEmail   functions.config().email.user: ",
    functions.config().email.user,
    "functions.config().email.password",
    functions.config().email.password,
    "   user:",
    user.email
  );

  const uomInfoItem = UOMInfo.find((uom) => event.uom === uom.uom);
  const html =
    `${trigger.message}<br/><br/>` +
    `<b>Device</b> ${event.deviceName}<br/>` +
    `<b>Value</b> ${event.value} ${uomInfoItem?.nameShort}`;

  const mailOptions = {
    from: "ourBoatMonitor <olupincorp@gmail.com>",
    to: user.email,
    subject: trigger.name, // email subject
    html: html, // email content in HTML
  };

  // Do the send
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(`error: ${JSON.stringify(error)}`);
    }
    if (info) {
      console.log(`Message Sent ${JSON.stringify(info.response)}`);
    }
  });
}
