import { Component, OnInit, Input } from "@angular/core";
import { Observable } from "rxjs";
import { Application } from "src/app/models/application.model";
import { View, ViewType, ViewTypeInfo } from "src/app/models/view.model";
import { ViewService } from "src/app/services/view.service";

@Component({
  selector: "app-viewslist",
  templateUrl: "./viewslist.component.html",
  styleUrls: ["./viewslist.component.scss"],
})
export class ViewslistComponent implements OnInit {
  @Input() application: Application;
  @Input() disabled: boolean;
  ViewTypeInfo = ViewTypeInfo;
  displayedColumns: string[] = ["name", "description", "viewType", "id"];
  views$: Observable<View[]>;

  constructor(private viewService: ViewService) {}

  ngOnInit() {
    this.views$ = this.viewService.findAll(this.application.id, 100);
  }

  getViewTypeInfoItem(viewType: ViewType) {
    // console.log("getViewTypeInfoItem", value);
    return this.ViewTypeInfo.find(
      (viewTypeInfo) => viewTypeInfo.viewType == viewType
    );
  }
}
