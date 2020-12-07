import { Component, OnInit, Input } from "@angular/core";
import { Observable } from "rxjs";
import { Application } from "src/app/models/application.model";
import {
  Trigger,
  TriggerAction,
  TriggerActionInfo,
} from "src/app/models/trigger.model";
import { TriggerService } from "src/app/services/trigger.service";

@Component({
  selector: "app-triggerslist",
  templateUrl: "./triggerslist.component.html",
  styleUrls: ["./triggerslist.component.scss"],
})
export class TriggerslistComponent implements OnInit {
  @Input() application: Application;
  @Input() disabled: boolean;
  TriggerActionInfo = TriggerActionInfo;
  displayedColumns: string[] = ["name", "description", "triggerAction", "id"];
  triggers$: Observable<Trigger[]>;

  constructor(private triggerService: TriggerService) {}

  ngOnInit() {
    this.triggers$ = this.triggerService.findAll(this.application.id, 100);
  }

  getTriggerActionInfoItem(value: number) {
    // console.log("getTriggerActionInfoItem", value);
    return this.TriggerActionInfo.find((ta) => ta.value == value);
  }
}
