import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import axios from 'axios';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}

  async createUser(body: any, token: any) {
    const headers = {
      Authorization: `Bearer ${token}`,
      accept: 'application/scim+json',
      'content-type': 'application/scim+json',
      usershouldnotneedtoresetpassword: true,
    };
    try {
      const response = await axios.post(`/api/v2.0/Users`, body, {
        headers: headers,
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async generateAccessToken() {
    const body = {
      grant_type: 'client_credentials',
      scope: environment.scope,
      client_id: environment.apiClientId,
      client_secret: environment.apiClientSecret,
    };
    console.log(body);
    try {
      const response = await axios.post(
        `/api/oauth2/token`,
        // 'https://cloudidentity1234.ice.ibmcloud.com/api/oauth2/token',
        new URLSearchParams(body).toString(),
        {
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.log(error);
      throw error;
    }
  }

  async loginUser(email: any, password: any) {
    const body: any = {
      grant_type: 'password',
      password: password,
      scope: environment.scope,
      username: email,
      client_id: environment.clientId,
      client_secret: environment.clientSecret,
    };
    try {
      const response = await axios.post(
        `/api/oauth2/token`,
        new URLSearchParams(body).toString()
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getUserData(token: any) {
    const headers = {
      Authorization: `Bearer ${token}`,
      usershouldnotneedtoresetpassword: false,
    };
    try {
      const response = await axios.get(`/api/v2.0/Me`, {
        headers: headers,
      });
      return response;
    } catch (error) {
      return error;
    }
  }

  async updateUserData(token: any, body: any) {
    const headers = {
      Authorization: `Bearer ${token}`,
      'content-type': 'application/scim+json',
    };
    try {
      const response = await axios.put(`/api/v2.0/Me`, body, {
        headers: headers,
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async generateEmailOTP(token: any, body: any) {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    try {
      const response = await axios.post(
        `/api/v2.0/factors/emailotp/transient/verifications`,
        // `https://cloudidentity1234.ice.ibmcloud.com/v2.0/factors/emailotp/transient/verifications`,

        body,
        {
          headers: headers,
        }
      );
      return response;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // Verify email otp
  async verifyEmailOTP(trxnId: any, token: any, body: any) {
    try {
      const header = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };
      const response = await axios.post(
        // `https://cloudidentity1234.ice.ibmcloud.com/v2.0/factors/emailotp/transient/verifications` +
        `/api/v2.0/factors/emailotp/transient/verifications/` +
          trxnId +
          '?returnJwt=true',
        body,
        {
          headers: header,
        }
      );
      return response;
    } catch (error) {
      console.log(error);

      throw error;
    }
  }

  async getAccessToken(token: any) {
    const headers = {
      'content-Type': 'application/x-www-form-urlencoded',
    };
    const body = {
      grant_type: 'authorization_code',
      code: token,
      redirect_uri: environment.CE_URL,
      client_id: environment.clientId,
      client_secret: environment.clientSecret,
      scope: environment.scope,
    };
    try {
      const response = await axios.post(`/api/oauth2/token`, body, {
        headers: headers,
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Generate email otp
  async generateSmsOTP(token: any, body: any) {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    try {
      const response = await axios.post(
        `/api/v2.0/factors/smsotp/transient/verifications`,
        body,
        {
          headers: headers,
        }
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  async verifySmsOTP(trxnId: any, token: any, body: any) {
    try {
      const header = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };
      const response = await axios.post(
        `/api/v2.0/factors/smsotp/transient/verifications/` +
          trxnId +
          '?returnJwt=true',
        body,
        {
          headers: header,
        }
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(token: any) {
    try {
      const header = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };
      const response = await axios.delete(`/api/v2.0/Me`, {
        headers: header,
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  getStats() {
    return this.http.get(`/user/stats`);
  }
}
