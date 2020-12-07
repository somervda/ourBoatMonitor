import { Pipe, PipeTransform } from "@angular/core";
import { Observable } from "rxjs";
import { firestore } from "firebase";
import { HelperService } from "../services/helper.service";

@Pipe({
  name: "doc",
})

/**
 * Resolves a document reference  into an observable of that document
 */
export class DocPipe implements PipeTransform {
  constructor(private helper: HelperService) {}

  transform<T>(docRef: firestore.DocumentReference<T>): Observable<T> {
    return this.helper.getDocRef(docRef);
  }
}
