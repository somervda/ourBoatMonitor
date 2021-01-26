import { DocumentReference } from "@angular/fire/firestore";

export interface View {
  id?: string;
  name: string;
  description: string;
  sensorRef: DocumentReference;
  viewType: ViewType;
  iconURL?: string;
  // Offset to apply to the event value
  offset?: number;
  // Scaling factor to apply to the offset result
  scale?: number;
}

/**
 * How the view is rendered
 */
export enum ViewType {
  "table" = 1,
  "line" = 2,
  "scatter" = 3,
}

export interface ViewTypeInfoItem {
  viewType: ViewType;
  name: string;
  nameShort: string;
}

export const ViewTypeInfo: ViewTypeInfoItem[] = [
  {
    viewType: ViewType.table,
    name: "Show as a table of values",
    nameShort: "Table",
  },
  {
    viewType: ViewType.line,
    name: "Show as a line chart",
    nameShort: "Line Chart",
  },
  {
    viewType: ViewType.scatter,
    name: "Show as a scatter chart",
    nameShort: "Scatter Chart",
  },
];
