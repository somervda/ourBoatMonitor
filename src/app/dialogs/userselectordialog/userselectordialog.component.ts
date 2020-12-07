import { Component, OnInit, Inject } from "@angular/core";
import { User } from "../../models/user.model";
import { Observable } from "rxjs";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { UserService } from "src/app/services/user.service";
import { DocumentReference } from "@angular/fire/firestore";
import { HelperService } from "src/app/services/helper.service";

@Component({
  selector: "app-userselectordialog",
  templateUrl: "./userselectordialog.component.html",
  styleUrls: ["./userselectordialog.component.scss"],
})
export class UserselectordialogComponent implements OnInit {
  users: DocumentReference[];
  users$: Observable<User[]>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userService: UserService,
    private dialogRef: MatDialogRef<UserselectordialogComponent>,
    private helper: HelperService
  ) {}

  ngOnInit(): void {
    this.users = this.data["refSelected"];
    // console.log("userselectordialog this.users", this.users);
    this.users$ = this.userService.findAll(100);
  }

  returnItem() {
    // console.log("Close:", this.users);
    this.dialogRef.close(this.users);
  }

  onListItemSelected(id) {
    // console.log("onListItemSelected:", id);
    if (id) {
      if (this.isInUser(id)) {
        // Remove from user array
        let index = this.users.findIndex(
          (ug) => this.helper.getDocRefId(ug) == id
        ); //find index in your array
        this.users.splice(index, 1); //remove element from array
      } else {
        const userDocRef = this.helper.docRef("users/" + id);
        this.users.push(userDocRef);
      }
    }
  }

  isInUser(id: string) {
    if (this.users.find((userRef) => this.helper.getDocRefId(userRef) == id))
      return true;
    return false;
  }
}
