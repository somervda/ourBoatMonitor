import { Component, OnInit, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { AuthService } from "./services/auth.service";
import { SwUpdate } from "@angular/service-worker";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Observable, fromEvent, Subscription } from "rxjs";
import { MessagingService } from "./services/messaging.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit, OnDestroy {
  title = "ourLora";
  isConnected = true;
  onlineEvent$: Observable<Event>;
  offlineEvent$: Observable<Event>;
  subscriptions$$: Subscription[] = [];
  showAlert = false;
  msgBody = "";
  msgTitle = "";

  constructor(
    public auth: AuthService,
    private swUpdate: SwUpdate,
    private snackBar: MatSnackBar,
    private messagingService: MessagingService,
    private ref: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.messagingService.receiveMessage();
    this.messagingService.currentMessage.subscribe(
      (message) => {
        this.showMessage(message);
      },
      (error) => {
        console.error("message subscribe error:", error);
      }
    );

    // Determine if we are connected
    // See https://robinraju.dev/developer/2018-07-26-detecting-user-offline-in-angular/
    this.onlineEvent$ = fromEvent(window, "online");
    this.offlineEvent$ = fromEvent(window, "offline");

    this.subscriptions$$.push(
      this.onlineEvent$.subscribe((e) => {
        this.isConnected = true;
      })
    );

    this.subscriptions$$.push(
      this.offlineEvent$.subscribe((e) => {
        this.isConnected = false;
      })
    );

    // Track PWA version
    if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe(() => {
        // Will show snackbar notification that PWA client is out of date
        // and needs to be refreshed. Note: iOS at 12.2  not working,
        // PWA apps do not recheck there cache on startup, it seems to be a bug
        // that should be resolved (If you really need this then some sort of
        // version check between firestore and application version probably is a solution)
        // In iOS you can refresh the application in the browser to force the PWA to reload
        let newVersionSnackBarRef = this.snackBar.open(
          "New version available.",
          "Load New Version?",
          {
            duration: 20000,
          }
        );
        newVersionSnackBarRef.onAction().subscribe(() => {
          console.log("New version action pressed");
          window.location.reload();
        });
      });
    }
  }

  logout() {
    this.auth.signOut();
  }

  /**
   * Code to extract title and body fields from the message object and display in the alert div.
   *
   * @param message the message object returned by a subscription to messaging
   */
  showMessage(message: object) {
    if (message && message != null) {
      try {
        this.msgTitle = message["notification"]["title"];
        this.msgBody = message["notification"]["body"];
        this.showAlert = true;
        // The change detection is very spooky with messages, it took forever
        // to get this working and requires a manual detectChanges .
        this.ref.detectChanges();
      } catch (e) {
        console.error(
          "Message display error: ",
          e,
          " message: ",
          JSON.stringify(message)
        );
      }
    }
  }

  hideAlert() {
    console.log("hideAlert");
    this.showAlert = false;
    this.ref.detectChanges();
  }

  ngOnDestroy(): void {
    /**
     * Unsubscribe all subscriptions to avoid memory leak
     */
    this.subscriptions$$.forEach((subscription) => subscription.unsubscribe());
  }
}
