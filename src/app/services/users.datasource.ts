import {CollectionViewer, DataSource} from "@angular/cdk/collections";

import { User } from '../models/user.model';
import { catchError, finalize } from 'rxjs/operators';
import { of, Observable, BehaviorSubject } from 'rxjs';
import { UserService } from './user.service';
import OrderByDirection = firebase.firestore.OrderByDirection;



export class UsersDataSource implements DataSource<User> {
    private usersSubject = new BehaviorSubject<User[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);
    public loading$ = this.loadingSubject.asObservable();
    constructor(private userService: UserService) {
    }

    loadUsers(filter:string,
                sortField: string,
                sortOrder: OrderByDirection,
                pageSize:number) {

        this.loadingSubject.next(true);

        this.userService.findUsers(filter, sortField,sortOrder,
             pageSize).pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            )
            .subscribe(users => {
                this.usersSubject.next(users);
                this.loadingSubject.next(false)
            });
    }

    connect(collectionViewer: CollectionViewer): Observable<User[]> {
        // console.log("Connecting data source");
        return this.usersSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.usersSubject.complete();
        this.loadingSubject.complete();
    }

}