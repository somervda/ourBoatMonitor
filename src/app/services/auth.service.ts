//import { AuthService } from "./auth.service";
// see https://fireship.io/lessons/angularfire-google-oauth/ for
// a detailed walk through of this authentication approach that is
// used to extend the firebase authentication information with
// custom user data (i.e. roles, app specific attributes)
import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from "@angular/fire/firestore";
import { Router } from "@angular/router";
import * as firebase from "firebase";
import { Observable, of } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { User } from "../models/user.model"; // optional

@Injectable({
  providedIn: "root",
})
export class AuthService {
  user$: Observable<User>;
  loggedIn$: Observable<boolean>;

  currentUser: User;
  public authStateChanges;

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router
  ) {
    // Get the auth state, then fetch the Firestore user document or return null
    // console.log("constructor");
    this.user$ = this.afAuth.authState.pipe(
      switchMap((user) => {
        // Logged in
        if (user) {
          return this.afs.doc<User>(`users/${user.uid}`).valueChanges();
        } else {
          // Logged out
          return of(null);
        }
      })
    );

    this.loggedIn$ = this.afAuth.authState.pipe(map((user) => !!user));

    // Set  up a authentication watched to reload user info when user is authenticated
    // this covers initial signon and when the user refreshes the browser.
    this.authStateChanges = this.afAuth.auth.onAuthStateChanged((authuser) => {
      // console.log("onAuthStateChanges authuser", authuser);
      // Keep a subscription to the user$ observable alive so currentUser is maintained as a property
      this.user$.subscribe((User) => {
        this.currentUser = User;
        // console.log("Update currentUser", User);
      });
    });
  }

  public updateUserData(authUserInfo) {
    // Sets user data to firestore on login
    const userRef: AngularFirestoreDocument<User> = this.afs.doc(
      `users/${authUserInfo.user.uid}`
    );
    // console.log("userRef", `users/${authUserInfo.user.uid}`);

    let data = {
      uid: authUserInfo.user.uid,
      email: authUserInfo.user.email,
      displayName: authUserInfo.user.displayName,
      dateLastLogon: firebase.firestore.FieldValue.serverTimestamp(),
    };

    if (authUserInfo.additionalUserInfo.isNewUser) {
      // Placeholder to initialize app specific user fieldsy
      data["dateCreated"] = firebase.firestore.FieldValue.serverTimestamp();
      // If the result does not provide a photoURL from the authentication provider
      // and its a new user then create a stand-in url
      if (authUserInfo.user.photoURL) {
        data["photoURL"] = authUserInfo.user.photoURL;
      } else {
        data["photoURL"] =
          "https://ui-avatars.com/api/?name=" + data.displayName;
      }
    }
    // console.log("updateUserData:", data, authUserInfo, userRef);
    userRef.set(data, { merge: true });

    return;
  }

  async signOut() {
    await this.afAuth.auth.signOut();
    this.router.navigate(["/"]);
  }

  persistSeason() {
    // See https://firebase.google.com/docs/auth/web/auth-state-persistence
    // This function will return immediately even though promise may still be
    // being actioned. See documentation , future authentication will wait for this function
    // to complete and persistance will be set appropriately

    // Note: Hard coded the firebase.auth.Auth.Persistence.SESSION property to save
    // executable footprint by not needing to import
    // the firebase library . Property value is "session"
    this.afAuth.auth
      .setPersistence("session")
      .then(function () {
        // Existing and future Auth states are now persisted in the current
        // session only. Closing the window would clear any existing state even
        // if a user forgets to sign out.
        // console.log("persistSeason worked");
      })
      .catch(function (error) {
        // Handle Errors here.
        console.log("persistSeason error ", error);
      });
  }

  setDateCreated() {}
}
