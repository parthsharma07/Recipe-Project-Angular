import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataStorageService } from '../shared/data-storage.service';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromApp from '../store/app.reducer';
import * as AuthActions from '../auth/store/auth.actions';
import * as RecipesActions from '../recipes/store/recipe.actions';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit,OnDestroy{
    private userSub: Subscription;
    isAuthenticated = false;

    constructor(private dataStorageService: DataStorageService, private authService: AuthService, private store: Store<fromApp.AppState>){}

    ngOnInit(){
        this.userSub = this.store.select('auth').pipe(map(authState => authState.user)).subscribe(user => {
            this.isAuthenticated = !!user;
        });
    }

    onSaveData(){
        this.store.dispatch(new RecipesActions.StoreRecipes());
    }

    onFetchData(){
        // this.dataStorageService.fetchRecipes().subscribe();
        this.store.dispatch(new RecipesActions.FetchRecipes());
    }

    onLogout(){
        this.store.dispatch(new AuthActions.Logout());
    }

    ngOnDestroy(){
        this.userSub.unsubscribe();
    }
}
