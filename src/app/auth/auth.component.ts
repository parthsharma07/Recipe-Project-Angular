import { Component, ComponentFactoryResolver, ViewChild, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService, AuthResponseData } from './auth.service';
import { Observable, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { AlertComponent } from '../shared/alert/alert.component';
import { PlaceholderDirective } from '../shared/placeholder/placeholder.directive';

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html'
})
export class AuthComponent implements OnDestroy{
    isLoginMode = true;
    isLoading = false;
    error: string = null;
    @ViewChild(PlaceholderDirective, {static: false}) alertComp: PlaceholderDirective;

    private closeSub: Subscription;

    constructor(private authService: AuthService, private router: Router, private compFactResolver: ComponentFactoryResolver){}

    onSwitchMode(){
        this.isLoginMode = !this.isLoginMode;
    }

    ngOnDestroy(){
        if(this.closeSub){
            this.closeSub.unsubscribe();
        }
    }

    onSubmit(form: NgForm){
        if(!form.valid){
            return;
        }
        const email = form.value.email;
        const password = form.value.password;
        let authObs: Observable<AuthResponseData>;

        this.isLoading = true;
        if(this.isLoginMode){
            authObs = this.authService.logIn(email,password);
        }else{
            authObs = this.authService.signUp(email,password);
        }

        authObs.subscribe(resData => {
            console.log(resData);
            this.isLoading = false;
            this.router.navigate(['/recipes']);
        },errorMessage =>{
            console.log(errorMessage);
            this.error = errorMessage;
            this.showErrorAlert(errorMessage);
            this.isLoading = false;
        });

        form.reset();
    }

    onHandleError(){
        this.error = null;
    }

    private showErrorAlert(message: string){
        const alertCmpFact = this.compFactResolver.resolveComponentFactory(AlertComponent);
        const viewContRef = this.alertComp.viewContRef;
        viewContRef.clear();
        const componentRef = viewContRef.createComponent(alertCmpFact);
        componentRef.instance.message = message;
        this.closeSub = componentRef.instance.close.subscribe(() => {
            this.closeSub.unsubscribe();
            viewContRef.clear();
        });
    }
}