import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../_services/user.service';
import { ToastrService } from 'ngx-toastr'; // Import ToastrService

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private userService: UserService,
    private toastr: ToastrService // Inject ToastrService
  ) {}
  loginForm!: FormGroup;
  loading = false;
  submitted = false;
  token = '';

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get fval() {
    return this.loginForm.controls;
  }

  async onFormSubmit() {
    const { email, password } = this.loginForm.value;
    try {
      const response = await this.userService.loginUser(email, password);
      if (response.status === 200) {
        localStorage.setItem('login_access_token', response.data.access_token);
        this.toastr.success('User LoggedIn successfully!!'); // Use ToastrService for success
        this.router.navigateByUrl('/dashboard');
      }
    } catch (error) {
      this.toastr.error('The user name or password is invalid.'); // Use ToastrService for error
    }
  }
}
