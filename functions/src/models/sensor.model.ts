export interface Sensor {
  id?: string;
  name: string;
  description: string;
  uom: UOM;
  acquisitionMapValue: string;
  acquisitionMapLatitude: string;
  acquisitionMapLongitude: string;
}

export enum UOM {
  "centigrade" = 1,
  "volts" = 2,
  "angle" = 3,
  "bit" = 4,
  "RH" = 5,
  "pascal" = 6,
  "meters_sec" = 7,
  "meters" = 8,
  "dimensionless" = 9,
}

export interface UOMInfoItem {
  uom: UOM;
  name: string;
  nameShort: string;
}

export const UOMInfo: UOMInfoItem[] = [
  {
    uom: UOM.bit,
    name: "Bit: Off(0)/On(1)",
    nameShort: "Bit",
  },
  {
    uom: UOM.centigrade,
    name: "Centigrade: Temperature",
    nameShort: "Centigrade",
  },
  {
    uom: UOM.angle,
    name: "Angle: Degrees 0-360",
    nameShort: "Angle",
  },
  {
    uom: UOM.dimensionless,
    name: "Dimensionless: Pure Scaler Value",
    nameShort: "None",
  },
  {
    uom: UOM.meters,
    name: "Meters: Length",
    nameShort: "Meters",
  },
  {
    uom: UOM.meters_sec,
    name: "M/s: Speed",
    nameShort: "M/s",
  },
  {
    uom: UOM.pascal,
    name: "Pascal: Pressure",
    nameShort: "Pascal",
  },
  {
    uom: UOM.RH,
    name: "RH: Relative Humidity%",
    nameShort: "RH%",
  },
  {
    uom: UOM.volts,
    name: "Volts",
    nameShort: "Volts",
  },
];
