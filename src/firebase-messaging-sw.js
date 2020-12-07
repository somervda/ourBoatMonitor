// Use same import script versions as current firebase version in package.json
// Also check out https://github.com/angular/angularfire/issues/2299#issuecomment-662405207 
// Some versioning updates needed to avoid RxJS errors
importScripts('https://www.gstatic.com/firebasejs/7.16.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.16.1/firebase-messaging.js');
firebase.initializeApp({
    apiKey: "AIzaSyAjBO7soCBefMn_6HvM2ucvalmheyOqOSE",
    authDomain: "ourlora-6afb9.firebaseapp.com",
    databaseURL: "https://ourlora-6afb9.firebaseio.com",
    projectId: "ourlora-6afb9",
    storageBucket: "ourlora-6afb9.appspot.com",
    messagingSenderId: "89347802465",
    appId: "1:89347802465:web:8c80ff474e7924c5f1f120",
    measurementId: "G-HQSS6FELTJ",
});
const messaging = firebase.messaging();