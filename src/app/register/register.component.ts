import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../_services/user.service';
import { environment } from '../../environments/environment';
import { ToastrService } from 'ngx-toastr'; // Import ToastrService

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private userService: UserService,
    private toastr: ToastrService // Inject ToastrService
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
      this.toastr.error(
        'Unexpected error. We encountered an issue processing your request. Please try again later.'
      ); // Use ToastrService
    }
  }

  async loginRedirect() {
    let redirectTo = `${environment.baseUrl}/oauth2/authorize?client_id=${environment.clientId}&client_secret=${environment.clientSecret}&response_type=code&redirect_uri=${environment.CE_URL}&scope=${environment.scope}`;
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
        this.toastr.success('Registration Successful.'); // Use ToastrService
        localStorage.setItem('userName', response.data.userName);
        this.router.navigateByUrl('/');
      } else {
        throw Error;
      }
    } catch (error: any) {
      this.toastr.error(error.response.data.detail);
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
        this.toastr.info('OTP sent to your email'); // Use ToastrService
      }
    } catch (error) {
      this.toastr.error(
        'Unable to send OTP. Please try again in a few moments.'
      ); // Use ToastrService
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
        this.toastr.success('Email Verified Successfully'); // Use ToastrService
        this.emailVerified = true;
      }
    } catch (error) {
      this.toastr.error(
        'OTP verification failed. Ensure you entered the correct code and try again.'
      ); // Use ToastrService
    }
  }
}
