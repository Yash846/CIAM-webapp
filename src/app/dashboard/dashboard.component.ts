import { Component, OnInit } from '@angular/core';
import { UserService } from '../_services/user.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  constructor(
    private userService: UserService,
    private router: Router,
  ) { }
  userData: any; 
  statsData: any;
  loading = false;
  header = [
    {
      config: 'ProjectId'
    },
    {
      config: 'Project Name'
    },
    {
      config: 'Project Desc'
    },
    {
      config: 'Project owner'
    }
  ]

  async ngOnInit() {
    let token = localStorage.getItem('login_token') || '';
    let tokenDetails = JSON.parse(token)
    const response = await this.userService.getUserData(tokenDetails.access_token);

    if((response as any).status == 200) {
      this.userData = (response as any).data
    } else if((response as any).response.status === 401) {
      localStorage.removeItem('login_token')
      this.router.navigateByUrl('/')
    }

    this.userService.getStats().subscribe(
      (data: any)=>{
        this.statsData = data
      },
      (error)=>{
        this.loading = false;
        alert(error.error.errMessage);
      }
    )
  }

}
