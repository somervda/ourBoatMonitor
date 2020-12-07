import { Device, IotDataSource } from "./models/device.model";
import { Devicetype } from "./models/devicetype.model";
import { Sensor } from "./models/sensor.model";
import { Event } from "./models/event.model";
import { Application } from "./models/application.model";
import * as functions from "firebase-functions";
import { db } from "./init";
import * as admin from "firebase-admin";
import { eventTrigger } from "./trigger";

/**
 * The https function accepting IOT data from the various IOT middleware systems supported
 * by the ourLora system. (Update user/password before using these)
 * Testing with curl:
 * curl -d '{"payload_fields" : {"dev_id": "curlTest01", "TEMPERATURE": 99}}' -H 'Content-Type: application/json' --user ourLora:password https://ourLora.com/iotBroker
 * curl -d '{"payload_fields" : {"dev_id": "curlTest02", "TEMPERATURE": 66}}' -H 'Content-Type: application/json' --user ourLora:password https://ourLora.com/iotBroker
 */
export const iotBroker = functions.https.onRequest(
  async (request, response) => {
    console.log("**** Start **** Headers: ", JSON.stringify(request.headers));
    console.log("Body: ", JSON.stringify(request.body));

    // Authentication header is stored as a firebase function config setting
    // i.e. firebase functions:config:set iotauthentication.header="Basic b3VyTG9yYTpwYXNzd29yZA=="
    // Change the authentication header value for your own implementation
    if (
      request.headers.authorization !==
      functions.config().iotauthentication.header
    ) {
      console.log("401 Unauthorized:", request.headers.authorization);
      response.status(401).send("Unauthorized");
      //  Exit if authentication information is missing or invalid
      return;
    }

    if (request.headers["content-type"] !== "application/json") {
      console.log("Invalid content type: ", request.headers["content-type"]);
      response.status(412).send("Precondition Failed, invalid content-type");
      // Exit is invalid content-type
      return;
    }

    if (!request.headers["user-agent"]) {
      console.log("Missing user agent:");
      response.status(412).send("Precondition Failed, missing user-agent");
      // Exit if missing user-agent
      return;
    }

    const userAgentSplitSlash = request.headers["user-agent"]?.split("/", 1);
    let userAgent = undefined;
    if (userAgentSplitSlash) {
      userAgent = userAgentSplitSlash[0].split(" ", 1);
    }
    if (userAgent) {
      let deviceId = undefined;
      let iotDataSource: IotDataSource;
      switch (userAgent[0].toUpperCase()) {
        case "SIGFOX": {
          iotDataSource = IotDataSource.SigFox;
          deviceId = request.body.payload_fields.deviceId;
          // SIG fox, you must add the "deviceId : {device}"  property to the to the payload_fields json
          break;
        }
        case "HTTP-TTN": {
          //statements;
          iotDataSource = IotDataSource.TheThingsNetwork;
          deviceId = request.body.dev_id;
          break;
        }
        case "CURL": {
          iotDataSource = IotDataSource.curl;
          //statements;
          deviceId = request.body.payload_fields["dev_id"];
          break;
        }
        case "LTE": {
          iotDataSource = IotDataSource.Direct;
          //statements;
          deviceId = request.body["device_id"];
          break;
        }
        case "HOLOGRAMCLOUD": {
          iotDataSource = IotDataSource.Hologram;
          //statements;
          deviceId = request.body["deviceId"];
          break;
        }
        default: {
          //statements;
          console.log(
            "Invalid user agent:",
            request.headers["user-agent"],
            " userAgent[0]:",
            userAgent[0]
          );
          response.status(412).send("Precondition Failed, invalid user agent");
          return;
        }
      }
      if (deviceId) {
        console.log("From " + iotDataSource + " deviceId:" + deviceId);
        const eventResult = await prepareAndWriteEvent(
          deviceId,
          iotDataSource,
          request.body
        )
          .then()
          .catch();
        response
          .status(eventResult)
          .send("Hello " + iotDataSource + " - " + deviceId);
      }
      return;
    } else {
      console.log("Missing user agent:");
      response.status(412).send("Precondition Failed");
      return;
    }
  }
);

/**
 * Looks up the device, devicetype and sensors documents associated with the IOT data
 * @param deviceId the device object associated with the IOT data
 * @param iotDataSource the IOT middleware providing the IOT data
 * @param requestBody The body content for this http request for this function
 */
async function prepareAndWriteEvent(
  deviceId: string,
  iotDataSource: IotDataSource,
  requestBody: any
) {
  // Doing all this stuff synchronously because asynchronous is hurting my brain
  // Assign all events for a particular acquisition operation the same timestamp;
  const timestamp = new Date();
  // console.log("prepareAndWriteEvent:", deviceId, JSON.stringify(requestBody));

  // Look up device, devicetype and sensors
  const devicesCollectionRef = <FirebaseFirestore.CollectionReference>(
    db.collection("devices")
  );

  const device = await devicesCollectionRef
    .where("deviceId", "==", deviceId)
    .limit(1)
    .get()
    .then((deviceQuery) => {
      if (deviceQuery.size === 0) {
        console.log("Device not found");
        return undefined;
      } else {
        console.log("Device found");
        return <Device>{
          id: deviceQuery.docs[0].id,
          ...deviceQuery.docs[0].data(),
        };
      }
    })
    .catch((e) => console.log("d error", e));

  if (device) {
    console.log("device:", JSON.stringify(device));
    if (iotDataSource !== device.iotDataSource) {
      console.log(
        "Error unexpected iotDataSource",
        iotDataSource,
        device.iotDataSource
      );
      return 412;
    }
  }

  // Retrieve the applications for the device
  let applications: Application[] = [];
  if (device) {
    if (device.id) {
      const applicationsRef = <FirebaseFirestore.CollectionReference>(
        db.collection("applications")
      );
      const deviceRef = db.collection("devices/").doc(device.id);
      await applicationsRef
        .where("deviceRefs", "array-contains", deviceRef)
        .get()
        .then((applicationDocs) => {
          applicationDocs.forEach((applicationDoc) =>
            applications.push(<Application>{
              id: applicationDoc.id,
              ...applicationDoc.data(),
            })
          );
        })
        .catch();
    }
  }

  // Look up devicetype
  if (device) {
    const devicetype = await device.deviceTypeRef
      .get()
      .then((dt) => {
        if (dt.exists) {
          return <Devicetype>{ id: dt.id, ...dt.data() };
        }
        return undefined;
      })
      .catch((e) => console.log("dt error", e));
    if (devicetype) {
      console.log("devicetype:", JSON.stringify(devicetype));
      // get sensors
      const sensorsCollectionRef = <FirebaseFirestore.CollectionReference>(
        db.collection(device.deviceTypeRef.path + "/sensors")
      );
      console.log("sensorsCollectionRef.path:", sensorsCollectionRef.path);
      const sensorSnapShots = await sensorsCollectionRef.get();
      const sensors = sensorSnapShots.docs.map((sensorSnapShot) => {
        const sensor = <Sensor>{
          id: sensorSnapShot.id,
          ...sensorSnapShot.data(),
        };
        return sensor;
      });
      // console.log("sensors: ", JSON.stringify(sensors));

      //  **********************************************
      // We have all the information needed to create an event document
      await writeEvent(
        device,
        devicetype,
        sensors,
        applications,
        iotDataSource,
        requestBody,
        timestamp
      );
    }
  }

  return 200;
}

/**
 * Extracts the sensor data from the request.body and writes an event document
 * @param device the device object associated with the IOT data
 * @param devicetype the devicetype object associated with the IOT data
 * @param sensors the sensor objects associated with the IOT data devicetype
 * @param applications the application objects that include the device
 * @param iotDataSource the source of the IOT data
 * @param requestBody the body of the http request sent to this function from the IOTDataSource
 * @param timestamp The current date and time (used as a single timestamp applied to all event documents generated from the IOT request)
 */
async function writeEvent(
  device: Device,
  devicetype: Devicetype,
  sensors: Sensor[],
  applications: Application[],
  iotDataSource: IotDataSource,
  requestBody: any,
  timestamp: Date
) {
  // Match up the sensor definition with the data in the requestBody data, and write an event
  // for each matching sensor
  sensors.forEach(async (sensor) => {
    if (getBodyField(requestBody, sensor.acquisitionMapValue)) {
      // Value property exists for the sensor, we can write an event
      // console.log("Sensor found:", sensor.name);
      const value = getBodyField(requestBody, sensor.acquisitionMapValue);

      // if device has gps sensor and lat/lng is available use those
      // values rather than the device default location
      let latitude = device.latitude;
      let longitude = device.longitude;
      if (
        sensor.acquisitionMapLatitude &&
        sensor.acquisitionMapLatitude.trim() !== "" &&
        sensor.acquisitionMapLongitude &&
        sensor.acquisitionMapLongitude.trim() !== ""
      ) {
        const sensorLatitude = getBodyField(
          requestBody,
          sensor.acquisitionMapLatitude
        );

        const sensorLongitude = getBodyField(
          requestBody,
          sensor.acquisitionMapLongitude
        );

        if (sensorLatitude && sensorLongitude) {
          latitude = sensorLatitude;
          longitude = sensorLongitude;
        }
      }

      // Create an array of application docRefs for including in the event
      let applicationRefs: admin.firestore.DocumentReference[] = [];
      applications.forEach((e) => {
        applicationRefs.push(
          <FirebaseFirestore.DocumentReference>(
            db.collection("applications").doc(e.id)
          )
        );
      });

      const event: Event = {
        timestamp: admin.firestore.Timestamp.fromDate(timestamp),
        value: value,
        location: new admin.firestore.GeoPoint(latitude, longitude),
        geohash: "",
        uom: sensor.uom,
        name: sensor.name,
        deviceRef: db.collection("devices").doc(device.id),
        sensorRef: db
          .collection("devicetypes")
          .doc(devicetype.id)
          .collection("sensors")
          .doc(sensor.id),
        applicationRefs: applicationRefs,
        iotDataSource: iotDataSource,
        deviceName: device.name,
      };
      console.log("Event to write", JSON.stringify(event));
      const { id } = await db.collection("events").add(event);
      console.log("after write", id);
      const newEvent: Event = <Event>{ id: id, ...event };
      eventTrigger(newEvent);
    }
  });
}

/**
 * Utility to pull the requested property from the body object. Returns undefined if matching property is not found
 * @param body Request.body object
 * @param fieldName Name of the property to extract from the request.body object. Uses the "." , in the fieldName, as a property
 * level indicator in the body object.
 */
function getBodyField(body: any, fieldName: string) {
  // console.log("getBodyField", fieldName, " body:", JSON.stringify(body));
  const fieldNameParts = fieldName.split(".", 3);
  // Check that all sub-levels of properties are present before
  // checking on the final property (or we get errors)
  switch (fieldNameParts.length) {
    case 1:
      return body[fieldNameParts[0]];
    case 2:
      if (typeof body[fieldNameParts[0]] === "undefined") {
        console.log("Undefined: ", fieldName);
        return undefined;
      } else {
        return body[fieldNameParts[0]][fieldNameParts[1]];
      }
    case 3:
      if (typeof body[fieldNameParts[0]] === "undefined") {
        console.log("Undefined: ", fieldName);
        return undefined;
      } else {
        if (typeof body[fieldNameParts[0]][fieldNameParts[1]] === "undefined") {
          console.log("Undefined: ", fieldName);
          return undefined;
        } else {
          console.log("3: fieldNameParts:", fieldNameParts);
          return body[fieldNameParts[0]][fieldNameParts[1]][fieldNameParts[2]];
        }
      }
  }
  console.log("missed fieldNameParts:", fieldNameParts);
  return undefined;
}
