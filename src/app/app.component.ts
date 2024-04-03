import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'tcs-angular-app';
  loggedInUser = localStorage.getItem('login_token');
  dropdownActive = false

  constructor(
    private router: Router,
  ) { }

  openDropdown(){
    this.dropdownActive = !this.dropdownActive
  }

  logoutUser() {
    this.dropdownActive = !this.dropdownActive
    localStorage.clear();
    window.open(`${environment.baseUrl}/idaas/mtfim/sps/idaas/logout?themeId=68eea2c6-f4af-4841-8fbe-c44de1392bf1`, "_self")
    this.router.navigateByUrl('/');
  }

  redirectToProfile() {
    this.dropdownActive = !this.dropdownActive
    this.router.navigateByUrl('/profile')
  }

}
