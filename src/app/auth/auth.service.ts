import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export interface AuthResponseData{
    kind: String;
    idToken: String;
    email: String;
    refreshToken: String;
    expiresIn: String;
    localId: String;
    registered?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService{
    constructor(private http: HttpClient){}

    signUp(email: String, password: String){
        return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=',
        {
            email: email,
            password: password,
            returnSecureToken: true
        }).pipe(catchError(errorRes => {
            let errorMessage = 'Unknown Error!';
            if(!errorRes.error || !errorRes.error.error){
                return throwError(errorMessage);
            }
            switch(errorRes.error.error.message){
                case 'EMAIL_EXISTS':
                    errorMessage = 'This email is already used';
            }
            return throwError(errorMessage);
        }));
    }

    logIn(email: String, password: String){
        return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=',
        {
            email: email,
            password: password,
            returnSecureToken: true
        });
    }
}