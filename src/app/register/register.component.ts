import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../_services/user.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private userService: UserService
  ) {}
  registerForm!: FormGroup;
  emailForm!: FormGroup;
  otpForm!: FormGroup;
  loading = false;
  submitted = false;
  emailSubmitted = false;
  otpSubmitted = false;
  emailVerified = false;
  trxnId = '';
  correlation = '';

  async getTokenUsingCode(token: string) {
    const response = await this.userService.getAccessToken(token);
    localStorage.setItem('login_token', JSON.stringify(response.data));
    this.router.navigateByUrl('/dashboard');
    // await AsyncStorage.setItem('login_token', JSON.stringify(response.data));
    // navigation.navigate('Home');
  }

  async ngOnInit() {
    const queryString = window.location.search;
    if (queryString.length > 0) {
      let query = queryString.split('&grant_id')[0];
      let code = query.split('?code=')[1];
      await this.getTokenUsingCode(code);
    }
    this.registerForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
    this.emailForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
    this.otpForm = this.formBuilder.group({
      emailOtp: ['', Validators.required],
    });
  }

  get fval() {
    return this.registerForm.controls;
  }
  get gval() {
    return this.emailForm.controls;
  }
  get ival() {
    return this.otpForm.controls;
  }

  async getAccessToken() {
    try {
      let response: any;
      response = await this.userService.generateAccessToken();

      localStorage.setItem('access_token', response.access_token);
      return response.access_token;
    } catch (err) {
      alert('sign up page acess token error');
    }
  }

  async loginRedirect() {
    let redirectTo = `${environment.baseUrl}/oauth2/authorize?client_id=${environment.clientId}&client_secret=${environment.clientSecret}&response_type=code&redirect_uri=${environment.redirectUri}&scope=${environment.scope}`;
    console.log(redirectTo);
    window.open(redirectTo, '_self');
  }

  async onSubmit() {
    const { firstName, lastName, password } = this.registerForm.value;
    const { email } = this.emailForm.value;
    const data = {
      schemas: [
        'urn:ietf:params:scim:schemas:core:2.0:User',
        'urn:ietf:params:scim:schemas:extension:ibm:2.0:User',
      ],
      userName: email,
      name: {
        familyName: lastName,
        givenName: firstName,
      },
      emails: [
        {
          value: email,
          type: 'work',
        },
      ],

      password: password,
      'urn:ietf:params:scim:schemas:extension:ibm:2.0:User': {
        userCategory: 'regular',
        customAttributes: [
          {
            name: 'role',
            values: ['admin'],
          },
        ],
      },
    };
    try {
      let token = localStorage.getItem('access_token');
      const response = await this.userService.createUser(data, token);
      if (response.status === 201) {
        alert('Registration Successfull.');
        localStorage.setItem('userName', response.data.userName);
        this.router.navigateByUrl('/');
      } else {
        throw Error;
      }
    } catch (error: any) {
      alert(error.response.data.detail);
    }
  }

  async getRandomInt() {
    return Math.floor(1000 + Math.random() * 9000);
  }

  async onSendOTP() {
    const { email } = this.emailForm.value;
    this.emailSubmitted = true;
    if (this.emailForm.invalid) {
      return;
    }

    await this.getAccessToken();

    const body = {
      correlation: await this.getRandomInt(),
      emailAddress: email,
    };
    try {
      let token = localStorage.getItem('access_token');
      const response = await this.userService.generateEmailOTP(token, body);
      if (response.status === 201) {
        this.trxnId = response.data.id;
        this.correlation = response.data.correlation;
        alert('OTP send to your email');
      }
    } catch (error) {
      alert('sign up page send otp error');
    }
  }

  async onVerifyOTP() {
    const { emailOtp } = this.otpForm.value;

    try {
      const body = {
        otp: emailOtp,
      };
      let token = localStorage.getItem('access_token');
      const response = await this.userService.verifyEmailOTP(
        this.trxnId,
        token,
        body
      );
      if (response.status === 200) {
        alert('Email Verified Successfully');
        this.emailVerified = true;
      }
    } catch (error) {
      alert('Error on verify OTP');
    }
  }
}
