import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { throwError, BehaviorSubject } from 'rxjs';
import { User } from './user.model';
import { Router } from '@angular/router';

export interface AuthResponseData{
    kind: string;
    idToken: string;
    email: string;
    refreshToken: string;
    expiresIn: string;
    localId: string;
    registered?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService{
    user = new BehaviorSubject<User>(null);
    private tokenExpirTimer: any;

    constructor(private http: HttpClient, private router: Router){}

    signUp(email: String, password: String){
        return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=',
        {
            email: email,
            password: password,
            returnSecureToken: true
        }).pipe(catchError(this.handleError), tap(resData =>{
            this.handleAuthentication(resData.email,resData.localId,resData.idToken,+resData.expiresIn);
        }));
    }

    autoLogin(){
        const userData: {
            email: string,
            id: string,
            _token: string,
            _tokenExpirationDate: string
        } = JSON.parse(localStorage.getItem('userData'));
        if(!userData){
            return;
        }
        const loadedUser = new User(
            userData.email,
            userData.id,
            userData._token,
            new Date(userData._tokenExpirationDate)
        );
        if(loadedUser.token){
            this.user.next(loadedUser);
            const expirDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
            this.autoLogout(expirDuration);
        }
    }

    logIn(email: String, password: String){
        return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=',
        {
            email: email,
            password: password,
            returnSecureToken: true
        }).pipe(catchError(this.handleError), tap(resData =>{
            this.handleAuthentication(resData.email,resData.localId,resData.idToken,+resData.expiresIn);
        }));
    }

    logout(){
        this.user.next(null);
        this.router.navigate(['/auth']);
        localStorage.clear();
        if(this.tokenExpirTimer){
            clearTimeout(this.tokenExpirTimer);
        }
        this.tokenExpirTimer = null;
    }

    autoLogout(expirDuration: number){
        this.tokenExpirTimer = setTimeout(() =>{
            this.logout();
        }, expirDuration);
    }

    private handleAuthentication(email: string, userId: string, token: string, expiresIn: number){
        const expirationDate = new Date(new Date().getTime() + (expiresIn * 1000));
        const user = new User(email,userId,token,expirationDate);
        this.user.next(user);
        this.autoLogout(expiresIn*1000);
        localStorage.setItem('userData', JSON.stringify(user));
    }

    private handleError(errorRes: HttpErrorResponse){
        let errorMessage = 'Unknown Error!';
            if(!errorRes.error || !errorRes.error.error){
                return throwError(errorMessage);
            }
            switch(errorRes.error.error.message){
                case 'EMAIL_EXISTS':
                    errorMessage = 'This email is already used';
                    break;
                case 'EMAIL_NOT_FOUND':
                    errorMessage = 'This email does not exist';
                    break;
                case 'INVALID_PASSWORD':
                    errorMessage = 'Password is incorrect';
                    break;
            }
            return throwError(errorMessage);
    }
}