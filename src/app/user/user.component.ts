import { MatDialog } from "@angular/material/dialog";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { AngularFireStorage } from "@angular/fire/storage";
import { ActivatedRoute } from "@angular/router";
import { Observable, Subscription } from "rxjs";
import { User } from "../models/user.model";
import { HelperService } from "../services/helper.service";
import { AuthService } from "./../services/auth.service";
import { UserService } from "./../services/user.service";
import { MessagingService } from "../services/messaging.service";
// import { AngularFireMessaging } from "@angular/fire/messaging";

@Component({
  selector: "app-user",
  templateUrl: "./user.component.html",
  styleUrls: ["./user.component.scss"],
})
export class UserComponent implements OnInit, OnDestroy {
  user$: Observable<User>;
  uid: string;
  user: User;
  userSubscription$$: Subscription;
  tokenSubscription$$: Subscription;
  // messageToken: string;
  // If only the photo can be updated unless the user has fullAccess
  fullAccess: boolean = false;

  showSpinner = false;
  fileUploadMsg = "";

  token: string;
  hasToken = false;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    public auth: AuthService,
    private storage: AngularFireStorage,
    private helper: HelperService,
    private messagingService: MessagingService // private angularFireMessaging: AngularFireMessaging
  ) {}

  ngOnInit() {
    this.uid = this.route.snapshot.paramMap.get("uid");
    if (
      this.auth.currentUser.isAdmin &&
      this.auth.currentUser.uid != this.uid
    ) {
      this.fullAccess = true;
    }
    if (
      !this.auth.currentUser.isAdmin &&
      this.auth.currentUser.uid != this.uid
    ) {
      this.helper.redirect("/notAuthorized");
    }

    this.user$ = this.userService.findUserByUid(this.uid);
    this.userSubscription$$ = this.user$.subscribe((user) => {
      this.user = user;
      this.hasToken = false;
      if (user.deviceMessagingToken && user.deviceMessagingToken != "") {
        this.hasToken = true;
      }
    });
    // Track the messaging token state
    // this.tokenSubscription$$ = this.angularFireMessaging.tokenChanges.subscribe(
    //   (token) => {
    //     this.token = token;
    //   }
    // );
    // this.messagingService.getTokenState();
    // this.tokenSubscription$$ = this.messagingService.currentToken.subscribe(
    //   (token) => this.token = token;
    // );
  }

  updateField(name: string, value: any) {
    console.log("updateField", name, value);
    if (this.fullAccess) {
      this.userService.dbFieldUpdate(this.uid, name, value);
    }
  }

  getStorageUrl(filename: string): Observable<any> {
    // console.log("getStorageUrl", filename);
    return this.storage
      .ref(`userphotos/${this.uid}/${filename}`)
      .getDownloadURL();
  }

  onUploadFile(event) {
    console.log("onUploadFile", event);
    const fileToUpload = event.target.files[0];
    console.log("fileToUpload", fileToUpload.size);
    if (fileToUpload.size > 150000) {
      this.fileUploadMsg =
        " File is too large to upload. Must be less than 150KB";
    } else {
      this.showSpinner = true;
      this.fileUploadMsg = "";
      const task = this.storage
        .upload(`userphotos/${this.uid}/${fileToUpload.name}`, fileToUpload)
        .then((t) => {
          this.getStorageUrl(fileToUpload.name)
            .toPromise()
            .then((url) =>
              this.userService.dbFieldUpdate(this.uid, "photoURL", url)
            );
          this.showSpinner = false;
        })
        .catch((e) => (this.showSpinner = false));
    }
  }

  getDate(inDate: any): string {
    let sDate = "";
    if (inDate && inDate != null) {
      sDate = inDate.toDate();
    }

    return sDate;
  }

  subscribeToMessaging() {
    console.log("subscribeToMessaging");
    this.messagingService.requestPermissionAndToken(this.user);
  }

  isE164(e164: string): boolean {
    if (e164 == "") {
      return true;
    }
    return /^\+\d{11,14}$/.test(e164);
  }

  onSmsPhoneE164Change(value: string) {
    console.log("onSmsPhoneE164Change", value);
    if (this.isE164(value)) {
      this.userService.dbFieldUpdate(this.uid, "smsPhoneE164", value);
    }
  }

  unsubscribeFromMessaging() {
    console.log("unsubscribeFromMessaging");
    this.messagingService.deleteToken(this.user);
  }

  ngOnDestroy() {
    if (this.userSubscription$$) this.userSubscription$$.unsubscribe();
    if (this.tokenSubscription$$) this.tokenSubscription$$.unsubscribe();
  }
}
