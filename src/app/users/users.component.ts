import { UserService } from './../services/user.service';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { UsersDataSource } from '../services/users.datasource';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatRow } from '@angular/material/table';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit , AfterViewInit {
  
  dataSource: UsersDataSource;
  displayedColumns= ["email","displayName","isAdmin", "isActivated","dateCreated"];

  
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  
  constructor(private userService : UserService) { }
  
  ngOnInit() {
    this.dataSource = new UsersDataSource(this.userService);
    
    this.dataSource.loadUsers( '',"email", 'asc', 100);
  }
  
  ngAfterViewInit(): void {
    this.sort.sortChange
    .pipe(
        tap(() => {
          console.log("sort",this.sort);
          this.loadUsersPage();
        })
    )
    .subscribe();
  }

  loadUsersPage() {
    this.dataSource.loadUsers(
        "",
        this.sort.active,
        this.sort.direction==""? "asc" : this.sort.direction ,
        100);
  }

}
