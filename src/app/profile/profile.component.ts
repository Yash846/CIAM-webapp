import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../_services/user.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private userService: UserService
  ) { }
  userData: any;
  updateUserData: any;
  profileForm!: FormGroup;
  userEmailForm!: FormGroup;
  userSmsForm!: FormGroup;
  loading = false;
  submitted = false;
  token = ''
  emailStatus = 'unverified'
  smsStatus = 'unverified'
  smsFormSubmitted = false
  activeTab = 1
  trxnId = ''
  correlation = ''
  smsTrxnId = ''
  smsCorrelation = ''
  correlationDisable = true

  async updateTab(tabNumber: number) {
    this.activeTab = tabNumber
  }
 
  async ngOnInit() {
    this.userEmailForm = this.formBuilder.group({
      email: ['', [Validators.required]],
      emailOtp: ['']
    });
    this.userSmsForm = this.formBuilder.group({
      phoneNo: ['', [Validators.required]],
      phoneOtp: ['']
    });
    this.profileForm = this.formBuilder.group({
      firstName: ['', [Validators.required]],
      userName: ['', [Validators.required]],
      middleName: [''],
      lastName: [''],
      country: [''],
      locality: [''],
      postalCode: [''],
      region: [''],
      streetAddress: [''],
    });
    let token = localStorage.getItem('login_token') || '';
    let tokenDetails = JSON.parse(token)
    const response = await this.userService.getUserData(tokenDetails.access_token);
    if((response as any).status == 200) {
      this.userData = (response as any).data
    } else if((response as any).response.status === 401) {
      localStorage.removeItem('login_token')
      this.router.navigateByUrl('/')
    }
  }
  
  get fval() { return this.profileForm.controls; }
  get gval() { return this.userEmailForm.controls; }
  get hval() { return this.userSmsForm.controls; }
  
  async onFormSubmit(){
    const { lastName, firstName, country, locality, postalCode, region, streetAddress, userName, middleName } = this.profileForm.value;
    this.submitted = true;
    if(this.profileForm.invalid) {
      return;
    }
    const body = {
      emails: this.userData.emails,
      addresses: [
        {
          country,
          locality,
          postalCode,
          region,
          streetAddress,
          type: "work"
        }
      ],
      schemas: [
        'urn:ietf:params:scim:schemas:core:2.0:User',
        'urn:ietf:params:scim:schemas:extension:ibm:2.0:User',
      ],
      name: {
        familyName: lastName,
        givenName: firstName,
        middleName: middleName
      },
      active: true,
      userName,
      phoneNumbers: this.userData.phoneNumbers
    };
    try {
      let token = localStorage.getItem('login_token') || '';
      let tokenDetails = JSON.parse(token)
      let response = await this.userService.updateUserData(tokenDetails.access_token, body)
      if(response.status === 200){
        alert('Profile updated successfully')
      }
    } catch (error: any) {
      alert(error.response.data.detail);
    }
  };

  async onEmailUpdate(){
    const { email } = this.userEmailForm.value;
    if(this.userEmailForm.invalid) {
      return;
    }
    const body = {
      emails: [
        {
          type: 'work',
          value: email
        }
      ],
      addresses: this.userData.addresses ? this.userData.addresses : [],
      schemas: [
        'urn:ietf:params:scim:schemas:core:2.0:User',
        'urn:ietf:params:scim:schemas:extension:ibm:2.0:User',
      ],
      name: this.userData.name,
      active: true,
      userName: this.userData.userName,
      phoneNumbers: this.userData.phoneNumbers ? this.userData.phoneNumbers : []
    };
    try {
      let token = localStorage.getItem('login_token') || '';
      let tokenDetails = JSON.parse(token)
      let response = await this.userService.updateUserData(tokenDetails.access_token, body)
      if(response.status === 200){
        alert('User email updated successfully')
      }
    } catch (error: any) {
      alert(error.response.data.detail);
    }
  };

  async onPhoneUpdate(){
    const { phoneNo } = this.userSmsForm.value;
    if(this.userSmsForm.invalid) {
      return;
    }
    const body = {
      emails: this.userData.emails ? this.userData.emails : [],
      addresses: this.userData.addresses ? this.userData.addresses : [],
      schemas: [
        'urn:ietf:params:scim:schemas:core:2.0:User',
        'urn:ietf:params:scim:schemas:extension:ibm:2.0:User',
      ],
      name: this.userData.name,
      active: true,
      userName: this.userData.userName,
      phoneNumbers: [
        {
          type: 'work',
          value: phoneNo
        }
      ]
    };
    try {
      let token = localStorage.getItem('login_token') || '';
      let tokenDetails = JSON.parse(token)
      let response = await this.userService.updateUserData(tokenDetails.access_token, body)
      if(response.status === 200){
        alert('User phone number updated successfully')
      }
    } catch (error: any) {
      alert(error.response.data.detail);
    }
  };


  async getRandomInt() {
    return Math.floor(1000 + Math.random() * 9000);
  };
  

  async onSendOTP() {
    const { email } = this.userEmailForm.value
    this.emailStatus = 'otpSent'
    if(this.userEmailForm.invalid) {
      return;
    }
    // await this.getAccessToken();
    let token = localStorage.getItem('login_token') || ''
    let tokenDetails = JSON.parse(token)
    
    const body = {
      correlation: await this.getRandomInt(),
      emailAddress: email,
    };
    try {
      const response = await this.userService.generateEmailOTP(tokenDetails.access_token, body);
      if(response.status === 201){
        this.trxnId = response.data.id
        this.correlation = response.data.correlation
        alert('OTP send to your email')
      }
    } catch (error) {
      alert('sign up page send otp error');
    }
  };

  async onVerifyOTP(){
    const { emailOtp } = this.userEmailForm.value
    try {
      const body = {
        otp: emailOtp,
      };
      let token = localStorage.getItem('login_token') || ''
      let tokenDetails = JSON.parse(token)
      const response = await this.userService.verifyEmailOTP(
        this.trxnId,
        tokenDetails.access_token,
        body,
      );
      if(response.status === 200){
        this.emailStatus = 'emailVerified'
        alert('Email Verified Successfully')
      }
    } catch (error) {
      alert('Error on verify OTP');
    }
  };

  async onSendSmsOTP() {
    const { phoneNo } = this.userSmsForm.value
    this.smsStatus = 'otpSent'
    if(this.userSmsForm.invalid) {
      return;
    }
    // await this.getAccessToken();
    let token = localStorage.getItem('login_token') || ''
    let tokenDetails = JSON.parse(token)
    
    const body = {
      correlation: await this.getRandomInt(),
      phoneNumber: phoneNo,
    };
    try {
      const response = await this.userService.generateSmsOTP(tokenDetails.access_token, body);
      if(response.status === 201){
        this.smsTrxnId = response.data.id
        this.smsCorrelation = response.data.correlation
        alert('OTP sms send to your phone')
      }
    } catch (error) {
      alert('sign up page send otp error');
    }
  };

  async onVerifySmsOTP(){
    const { phoneOtp } = this.userSmsForm.value
    try {
      const body = {
        otp: phoneOtp,
      };
      let token = localStorage.getItem('login_token') || ''
      let tokenDetails = JSON.parse(token)
      const response = await this.userService.verifySmsOTP(
        this.smsTrxnId,
        tokenDetails.access_token,
        body,
      );
      if(response.status === 200){
        this.smsStatus = 'smsVerified'
        alert('Phone number Verified Successfully')
      }
    } catch (error) {
      alert('Error on verify OTP');
    }
  };

  async onDeleteAccount(){
    let token = localStorage.getItem('login_token') || ''
    let tokenDetails = JSON.parse(token)
    const response = await this.userService.deleteUser(tokenDetails.access_token);
    if(response.status == 204) {
      localStorage.removeItem('login_token')
      this.router.navigateByUrl('/')
    }
  }

  async changePasswordRedirect() {
    var buildChangePasswordURL = `${environment.baseUrl}/authsvc/mtfim/sps/authsvc?PolicyId=urn:ibm:security:authentication:asf:changepassword&login_hint=${this.userData.userName}&themeId=68eea2c6-f4af-4841-8fbe-c44de1392bf1`;
    window.open(buildChangePasswordURL, "_self");
  }

}

