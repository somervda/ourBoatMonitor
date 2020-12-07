import { Component, OnInit, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: "app-confirmdialog",
  templateUrl: "./confirmdialog.component.html",
  styleUrls: ["./confirmdialog.component.scss"],
})
export class ConfirmdialogComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ConfirmdialogComponent>
  ) {}

  ngOnInit(): void {}

  returnChoice(choice: boolean) {
    this.dialogRef.close(choice);
  }
}
