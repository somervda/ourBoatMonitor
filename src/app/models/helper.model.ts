// Key/Value Pair
export interface Kvp {
  key: string;
  value: any;
}

export enum Crud {
  "Create" = "C",
  "Read" = "R",
  "Update" = "U",
  "Delete" = "D",
}

/**
 * The definition of clickable icon interface  used for things like subheading
 * to be able to build a array of icons (material icons) that will show on the right side of the
 * page, 2 actions are possible , either a routerLink being invoked or a click events being emitted with
 * a specific value.
 *
 */
export interface IconAction {
  icon: string;
  toolTip: string;
  routerLink?: string;
  emitValue?: string;
}
