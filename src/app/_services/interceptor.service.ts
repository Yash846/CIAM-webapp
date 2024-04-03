import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from "@angular/common/http";
import { Observable } from "rxjs";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";

@Injectable()
export class InterceptorService implements HttpInterceptor {
    
    intercept(
        req: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        let reqUrl = environment.apiBaseUrl;
        let token = localStorage.getItem('login_token') || ''
        let tokenDetails = JSON.parse(token)
        req = req.clone({
            url: reqUrl +""+ req.url,
            headers: req.headers.set('access_token', tokenDetails.access_token)
        });
        return next.handle(req);
    }
}
    