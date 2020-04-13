import { Actions, ofType, Effect } from '@ngrx/effects';
import * as AuthActions from './auth.actions';
import { switchMap, catchError, map, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { of } from 'rxjs';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../user.model';
import { AuthService } from '../auth.service';

export interface AuthResponseData{
    kind: string;
    idToken: string;
    email: string;
    refreshToken: string;
    expiresIn: string;
    localId: string;
    registered?: boolean;
}

const handleAuthentication = (expiresIn: number, email: string, userId: string, token: string) => {
    const expirationDate = new Date(new Date().getTime() + (expiresIn * 1000));
    const user = new User(email,userId,token,expirationDate);
    localStorage.setItem('userData', JSON.stringify(user));
            return new AuthActions.AuthenticateSuccess({
                email: email,
                userId: userId,
                token: token,
                expirationDate: expirationDate
            });
};

const handleError = (errorRes: any) => {
    let errorMessage = 'Unknown Error!';
            if(!errorRes.error || !errorRes.error.error){
                return of(new AuthActions.AuthenticateFail(errorMessage)); 
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
           return of(new AuthActions.AuthenticateFail(errorMessage)); 
};

@Injectable()
export class AuthEffects{

    @Effect()
    authSignup = this.actions$.pipe(
        ofType(AuthActions.SIGNUP_START),
        switchMap((signupAction: AuthActions.SignupStart) => {
            return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + environment.firebaseAPIKey,
        {
            email: signupAction.payload.email,
            password: signupAction.payload.password,
            returnSecureToken: true
        }).pipe(tap(resData => {
            this.authService.autoLogout(+resData.expiresIn * 1000);
        }),
            map(resData => {
            return handleAuthentication(+resData.expiresIn, resData.email, resData.localId, resData.idToken);
        }),catchError(errorRes => {
            return handleError(errorRes);
        }));
        })
    );

    @Effect()
    authLogin = this.actions$.pipe(
        ofType(AuthActions.LOGIN_START),
        switchMap((authData: AuthActions.LoginStart) => {
            return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + environment.firebaseAPIKey,
        {
            email: authData.payload.email,
            password: authData.payload.password,
            returnSecureToken: true
        }).pipe(tap(resData => {
            this.authService.autoLogout(+resData.expiresIn * 1000);
        }),map(resData => {
            return handleAuthentication(+resData.expiresIn, resData.email, resData.localId, resData.idToken);
        }),catchError(errorRes => {
            return handleError(errorRes);
        }));
        }),

    );

    @Effect({dispatch: false})
    authRedirect = this.actions$.pipe(ofType(AuthActions.AUTHENTICATE_SUCCESS, AuthActions.LOGOUT),
    tap(() =>{
        this.router.navigate(['/']);
    }));

    @Effect()
    autoLogin = this.actions$.pipe(ofType(AuthActions.AUTO_LOGIN), map(() => {
        const userData: {
            email: string,
            id: string,
            _token: string,
            _tokenExpirationDate: string
        } = JSON.parse(localStorage.getItem('userData'));
        if(!userData){
            return { type: 'dummy' };
        }
        const loadedUser = new User(
            userData.email,
            userData.id,
            userData._token,
            new Date(userData._tokenExpirationDate)
        );
        if(loadedUser.token){
            // this.user.next(loadedUser);
            const expirDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
            // this.autoLogout(expirDuration);
            this.authService.autoLogout(expirDuration);
            return new AuthActions.AuthenticateSuccess({
                email: loadedUser.email,
                userId: loadedUser.id,
                token: loadedUser.token,
                expirationDate: new Date(userData._tokenExpirationDate)
            });
            
        }
        return { type: 'dummy' };
    }));

    @Effect({dispatch: false})
    authLogout = this.actions$.pipe(ofType(AuthActions.LOGOUT), tap(() => {
        this.authService.clearLogoutTimer();
        localStorage.removeItem('userData');
        this.router.navigate(['/auth']);
    }));

    constructor(private actions$: Actions, private http: HttpClient, private router: Router, private authService: AuthService){}
}