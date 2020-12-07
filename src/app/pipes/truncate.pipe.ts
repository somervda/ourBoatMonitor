import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "truncate",
})
export class TruncatePipe implements PipeTransform {
  transform(inString: string, maxLength: number): string {
    return inString.length < maxLength
      ? inString
      : inString.substring(0, maxLength - 1) + "...";
  }
}
