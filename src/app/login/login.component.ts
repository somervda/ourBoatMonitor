import { Component, NgZone, OnDestroy, OnInit } from "@angular/core";
import * as firebaseui from "firebaseui";
import * as firebase from "firebase/app";
import { AngularFireAuth } from "@angular/fire/auth";
import { Router } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: "login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit, OnDestroy {
  ui: firebaseui.auth.AuthUI;

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private ngZone: NgZone,
    private auth: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    const uiConfig = {
      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
        {
          provider: "microsoft.com",
          providerName: "Microsoft",
          buttonColor: "#2F2F2F",
          iconUrl:
            "https://docs.microsoft.com/en-us/azure/active-directory/develop/media/howto-add-branding-in-azure-ad-apps/ms-symbollockup_mssymbol_19.png",
          loginHintKey: "login_hint",
          // Request consent each time user logs into microsoft account
          // ,
          // customParameters: {
          //   prompt: 'consent'`
          // }
          customParameters: {
            // Forces account selection even when one account
            // is available.
            prompt: "select_account",
          },
        },
      ],
      // Turn off the credential helper - remove to enable
      credentialHelper: firebaseui.auth.CredentialHelper.NONE,
      callbacks: {
        signInSuccessWithAuthResult: this.onLoginSuccessful.bind(this),
      },
    };

    this.ui = new firebaseui.auth.AuthUI(this.afAuth.auth);
    // Persist user authentication only for the current session
    this.auth.persistSeason();
    this.ui.start("#firebaseui-auth-container", uiConfig);
  }

  ngOnDestroy() {
    this.ui.delete();
  }

  /**
   * Will create or update the user document
   * @param authUserInfo User information from the authentication service
   */
  async onLoginSuccessful(authUserInfo) {
    // firebase.rules is behaving badly after signon. It does not seem
    // to have the request.auth info immediately , so added a delay
    // in this process before doing the updateUserData.
    // Try taking this out as I think I only need it because of however
    // I set up my fmstarter firebase instance.
    console.log("onLoginSuccessful:", authUserInfo);
    await this.sleep(100);
    console.log("onLoginSuccessful: after sleep");
    this.auth.updateUserData(authUserInfo);

    this.snackBar.open("Logon successful for " + authUserInfo.user.email, "", {
      duration: 5000,
    });

    this.ngZone.run(() => this.router.navigateByUrl("/"));
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
