import { Component, OnInit } from '@angular/core';
import {Location, LocationStrategy, PathLocationStrategy} from '@angular/common';
import {Metrika} from 'ng-yandex-metrika';
import {NavigationEnd, Router} from '@angular/router';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss'],
  providers: [Location, {provide: LocationStrategy, useClass: PathLocationStrategy}],
})
export class MainPageComponent implements OnInit {

  constructor(
    private metrika: Metrika,
    private router: Router,
    public location: Location,
  ) {

    let prevPath = this.location.path();

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const newPath = this.location.path();

        this.metrika.hit(newPath, {
          referer: prevPath,
        });

        prevPath = newPath;
      }
    });
  }

  ngOnInit(): void {
  }

}
